import { Request, Response } from 'express';
import { listUserNotifications, updateUserNotification, countUserUnreadNotifications } from '../repositories/userNotificationRepository';
import { baseResponse } from '../utils/baseResponse';
import { verifyJwt } from '../utils/jwt';

// Get all notifications for current user
export const getUserNotifications = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const notifications = await listUserNotifications(payload.userId);
  res.json(baseResponse({ success: true, data: notifications }));
};

// Mark notification as read
export const markNotificationRead = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { notificationId } = req.params;
  const updated = await updateUserNotification(notificationId, payload.userId, { isRead: true, readAt: new Date() });
  res.json(baseResponse({ success: true, data: updated }));
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const count = await countUserUnreadNotifications(payload.userId);
  res.json(baseResponse({ success: true, data: { unreadCount: count } }));
};
