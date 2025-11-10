import { Router } from 'express';
import { getUserNotifications, markNotificationRead, getUnreadCount } from '../controllers/userNotificationController';

const router = Router();

// Get all notifications for current user
router.get('/notifications/me', getUserNotifications);

// Mark notification as read
router.post('/notifications/:notificationId/read', markNotificationRead);

// Get unread notification count
router.get('/notifications/me/unread-count', getUnreadCount);

export default router;
