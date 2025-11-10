import { Router } from 'express';
import { requireAuth } from '../utils/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { createBroadcast, getUserNotifications, markNotificationRead } from '../controllers/notificationController';

const router = Router();


router.post('/broadcast', requireAuth, requireRole(['ORGANIZER']), createBroadcast);
router.get('/me/notifications', requireAuth, getUserNotifications);
router.patch('/me/notifications/:id/read', requireAuth, markNotificationRead);

export default router;
