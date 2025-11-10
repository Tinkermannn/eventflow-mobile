import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { verifyJwt } from '../utils/jwt';

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? verifyJwt(token) as any : null;
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    // Attach user info to request for downstream use
    (req as any).user = user;
    next();
  };
};
