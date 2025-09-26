import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function createPost(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { imageUrl, caption } = req.body || {};
    if (!user?.uid) return res.status(401).json({ error: 'Unauthorized' });
    if (!imageUrl || typeof imageUrl !== 'string') return res.status(400).json({ error: 'imageUrl required' });
    if (!caption || typeof caption !== 'string') return res.status(400).json({ error: 'caption required' });

    await prisma.user.upsert({
      where: { id: user.uid },
      update: {},
      create: { id: user.uid, username: `user_${user.uid.slice(0, 6)}` },
    });

    const post = await prisma.post.create({ data: { userId: user.uid, imageUrl, caption } });
    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}



export async function getPost(req: Request, res: Response) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id }, include: { user: { select: { id: true, username: true } } } });
    if (!post) return res.status(404).json({ error: 'Not found' });
    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function likePost(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user?.uid) return res.status(401).json({ error: 'Unauthorized' });
    const postId = req.params.id;
    await prisma.$transaction(async (tx) => {
      await tx.like.upsert({ where: { postId_userId: { postId, userId: user.uid } }, update: {}, create: { postId, userId: user.uid } });
      await tx.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}



