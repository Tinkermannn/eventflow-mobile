import { Request, Response } from 'express';
import { createNotification } from '../repositories/notificationRepository';
import { listUserNotifications, updateUserNotification } from '../repositories/userNotificationRepository';
import { baseResponse } from '../utils/baseResponse';
import { verifyJwt } from '../utils/jwt';
import { emitNotification } from '../utils/socket';


export const createBroadcast = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { id: eventId } = req.params;
  const { category, message, title, type } = req.body;
  if (!category || !message || !title) return res.status(400).json(baseResponse({ success: false, error: 'Missing fields' }));
  const notification = await createNotification({
    eventId,
    category,
    message,
    title,
    type: type || 'BROADCAST'
  });
  emitNotification({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    eventId: notification.eventId,
    category: notification.category,
    createdAt: notification.createdAt
  });
  res.json(baseResponse({ success: true, data: notification }));
};

export const getUserNotifications = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const notifications = await listUserNotifications(payload.userId);
  res.json(baseResponse({ success: true, data: notifications }));
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { id } = req.params;
  const userId = payload.userId;
  const notif = await updateUserNotification(id, userId, { isRead: true, readAt: new Date() });
  res.json(baseResponse({ success: true, data: notif }));
};
