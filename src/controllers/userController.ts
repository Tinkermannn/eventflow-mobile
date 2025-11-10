import { Request, Response } from 'express';
import { findUserById, updateUser as updateUserRepo, deleteUser as deleteUserRepo } from '../repositories/userRepository';
import { baseResponse } from '../utils/baseResponse';
import { verifyJwt } from '../utils/jwt';


export const getProfile = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const user = await findUserById(payload.userId);
  if (!user) return res.status(404).json(baseResponse({ success: false, error: 'User not found' }));
  res.json(baseResponse({ success: true, data: user }));
};

export const updateProfile = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { name, phoneNumber, avatarUrl } = req.body;
  const user = await updateUserRepo(payload.userId, { name, phoneNumber, avatarUrl });
  res.json(baseResponse({ success: true, data: user }));
};

export const deleteUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  await deleteUserRepo(payload.userId);
  res.json(baseResponse({ success: true }));
};
