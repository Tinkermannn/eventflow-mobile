import { Request, Response } from 'express';
import { findDeviceByPushToken, createDevice, updateDevice, deleteDevice as deleteDeviceRepo, findDevicesByUserId } from '../repositories/deviceRepository';
import { baseResponse } from '../utils/baseResponse';
import { verifyJwt } from '../utils/jwt';

// Register or update device push token
export const registerDevice = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { pushToken } = req.body;
  if (!pushToken) return res.status(400).json(baseResponse({ success: false, error: 'Missing pushToken' }));
  let device = await findDeviceByPushToken(pushToken);
  if (device) {
    device = await updateDevice(device.id, { userId: payload.userId, lastLoginAt: new Date() });
  } else {
    device = await createDevice({ userId: payload.userId, pushToken });
  }
  res.json(baseResponse({ success: true, data: device }));
};

// Get all devices for current user
export const getMyDevices = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const devices = await findDevicesByUserId(payload.userId);
  res.json(baseResponse({ success: true, data: devices }));
};

// Delete device (logout)
export const deleteDevice = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { deviceId } = req.params;
  await deleteDeviceRepo(deviceId);
  res.json(baseResponse({ success: true }));
};
