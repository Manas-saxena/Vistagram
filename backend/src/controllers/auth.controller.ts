import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const ACCESS_TTL: SignOptions['expiresIn'] = (process.env.JWT_ACCESS_TTL as any) || '15m';
const REFRESH_TTL_DAYS = parseInt(process.env.JWT_REFRESH_TTL_DAYS || '30', 10);
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

function signAccess(userId: string) {
  const opts: SignOptions = { expiresIn: ACCESS_TTL, subject: userId };
  return jwt.sign({}, ACCESS_SECRET as jwt.Secret, opts);
}

function generateRefreshToken() {
  // Use random id inside JWT jti, but we persist a hash of the random token string separately
  const jti = randomUUID();
  const opts: SignOptions = { expiresIn: `${REFRESH_TTL_DAYS}d`, subject: 'refresh' };
  const token = jwt.sign({ jti }, REFRESH_SECRET as jwt.Secret, opts);
  return { token, jti };
}

async function persistRefresh(userId: string, token: string, req: Request) {
  const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt, userAgent: req.header('user-agent') || null, ip: req.ip },
  });
}

function setRefreshCookie(res: Response, token: string) {
  const maxAge = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
  res.cookie('refresh_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth',
    maxAge,
  });
}

export async function login(req: Request, res: Response) {
  try {
    const { emailOrUsername, password } = req.body || {};
    if (!emailOrUsername || !password) return res.status(400).json({ error: 'email/username and password required' });
    const where = emailOrUsername.includes('@')
      ? { email: emailOrUsername.toLowerCase() }
      : { user: { username: emailOrUsername.toLowerCase() } };
    const auth = await prisma.localAuth.findFirst({ where, include: { user: true } });
    if (!auth) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, auth.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken = signAccess(auth.userId);
    const { token: refreshToken } = generateRefreshToken();
    await persistRefresh(auth.userId, refreshToken, req);
    setRefreshCookie(res, refreshToken);
    return res.json({ accessToken, user: { id: auth.user.id, username: auth.user.username, email: auth.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body || {};
    if (!email || !username || !password) return res.status(400).json({ error: 'email, username, password required' });
    const emailNorm = String(email).toLowerCase();
    const userNorm = String(username).toLowerCase();
    if (!/.+@.+\..+/.test(emailNorm)) return res.status(400).json({ error: 'invalid email' });
    if (userNorm.length < 3) return res.status(400).json({ error: 'username too short' });
    if (String(password).length < 8) return res.status(400).json({ error: 'password too short' });

    // Explicitly check both uniques to give a clear error and avoid hitting DB unique
    const [emailTaken, usernameTaken] = await Promise.all([
      prisma.localAuth.findUnique({ where: { email: emailNorm } }),
      prisma.user.findUnique({ where: { username: userNorm } }),
    ]);
    if (emailTaken) return res.status(409).json({ error: 'email already in use' });
    if (usernameTaken) return res.status(409).json({ error: 'username already in use' });

    let user;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    try {
      await prisma.$transaction(async (tx) => {
        user = await tx.user.create({ data: { username: userNorm } });
        await tx.localAuth.create({ data: { userId: (user as any).id, email: emailNorm, passwordHash } });
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        // Map unique violations explicitly
        const target = e?.meta?.target as string[] | undefined;
        if (target?.includes('username')) return res.status(409).json({ error: 'username already in use' });
        if (target?.includes('email')) return res.status(409).json({ error: 'email already in use' });
        return res.status(409).json({ error: 'email or username already in use' });
      }
      throw e;
    }

    const accessToken = signAccess(user.id);
    const { token: refreshToken } = generateRefreshToken();
    await persistRefresh(user.id, refreshToken, req);
    setRefreshCookie(res, refreshToken);
    return res.json({ accessToken, user: { id: user.id, username: user.username, email: emailNorm } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const cookie = req.cookies?.refresh_token as string | undefined;
    if (!cookie) return res.status(401).json({ error: 'No refresh' });
    // validate signature
    try { jwt.verify(cookie, REFRESH_SECRET); } catch { return res.status(401).json({ error: 'Invalid refresh' }); }
    // find hashed match
    const tokens = await prisma.refreshToken.findMany({ where: { revokedAt: null, expiresAt: { gt: new Date() } } });
    let match: any = null;
    for (const t of tokens) {
      if (await bcrypt.compare(cookie, t.tokenHash)) { match = t; break; }
    }
    if (!match) return res.status(401).json({ error: 'Refresh not found' });
    const accessToken = signAccess(match.userId);
    // rotate refresh
    await prisma.refreshToken.update({ where: { id: match.id }, data: { revokedAt: new Date() } });
    const { token: newRefresh } = generateRefreshToken();
    await persistRefresh(match.userId, newRefresh, req);
    setRefreshCookie(res, newRefresh);
    return res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const cookie = req.cookies?.refresh_token as string | undefined;
    if (cookie) {
      const tokens = await prisma.refreshToken.findMany({ where: { revokedAt: null } });
      for (const t of tokens) {
        if (await bcrypt.compare(cookie, t.tokenHash)) {
          await prisma.refreshToken.update({ where: { id: t.id }, data: { revokedAt: new Date() } });
          break;
        }
      }
    }
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


