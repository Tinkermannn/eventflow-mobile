import { Request, Response } from 'express';
import { findUserByEmail, createUser, updateUser as updateUserRepo, deleteUser as deleteUserRepo } from '../repositories/userRepository';
import { baseResponse } from '../utils/baseResponse';
import bcrypt from 'bcryptjs';
import { signJwt, verifyJwt } from '../utils/jwt';

export const updateUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { name, phoneNumber, avatarUrl, password } = req.body;
  let data: any = { name, phoneNumber, avatarUrl };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  const user = await updateUserRepo(payload.userId, data);
  res.json(baseResponse({ success: true, data: user }));
};

export const deleteUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  await deleteUserRepo(payload.userId);
  res.json(baseResponse({ success: true }));
};

// ...existing code...

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phoneNumber } = req.body;
  if (!name || !email || !password) return res.status(400).json(baseResponse({ success: false, error: 'Missing fields' }));
  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json(baseResponse({ success: false, error: 'Email already registered' }));
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, passwordHash, phoneNumber });
  const token = signJwt({ userId: user.id, role: user.role });
  res.json(baseResponse({ success: true, data: { user, token } }));
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json(baseResponse({ success: false, error: 'Missing fields' }));
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) return res.status(401).json(baseResponse({ success: false, error: 'Invalid credentials' }));
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json(baseResponse({ success: false, error: 'Invalid credentials' }));
  const token = signJwt({ userId: user.id, role: user.role });
  res.json(baseResponse({ success: true, data: { user, token } }));
};


