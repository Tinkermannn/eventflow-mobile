/**
 * File: requireAuth.ts
 * Author: eventFlow Team
 * Deskripsi: Middleware dan utilitas untuk validasi autentikasi JWT pada setiap request API.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Express, JWT
 */
import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from './jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as unknown : null;
  if (!payload || typeof payload !== 'object' || !('userId' in payload)) return res.status(401).json({ error: 'Unauthorized' });
  (req as unknown as { user: typeof payload }).user = payload;
  next();
}
