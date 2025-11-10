import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from './jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  (req as any).user = payload;
  next();
}
