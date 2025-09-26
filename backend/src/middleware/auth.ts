import { Request, Response, NextFunction } from 'express';

// Dev auth: reads x-user-id; replace with Firebase token verification later
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.header('x-user-id');
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  (req as any).user = { uid: userId };
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header('x-user-id');
  if (userId) (req as any).user = { uid: userId };
  next();
}


