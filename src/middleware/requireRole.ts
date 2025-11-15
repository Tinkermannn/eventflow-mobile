/**
 * File: requireRole.ts
 * Author: eventFlow Team
 * Deskripsi: Middleware untuk validasi role user pada endpoint tertentu (misal: ORGANIZER, PARTICIPANT).
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Express, JWT
 */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { verifyJwt } from '../utils/jwt';

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? verifyJwt(token) as unknown : null;
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: (payload as { userId: string }).userId } });
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    // Attach user info to request for downstream use
    (req as unknown as { user: typeof user }).user = user;
    next();
  };
};
