import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function login(req: Request, res: Response) {
  try {
    const { username } = req.body || {};
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'username (min 3 chars) required' });
    }
    const normalized = username.trim().toLowerCase();
    // Upsert a user with deterministic id for dev (cuid prevents collisions if new)
    const existing = await prisma.user.findUnique({ where: { username: normalized } });
    let user;
    if (existing) {
      user = existing;
    } else {
      user = await prisma.user.create({ data: { username: normalized } });
    }
    // Dev token is just the user.id to be used as x-user-id header
    return res.json({ user: { id: user.id, username: user.username }, token: user.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


