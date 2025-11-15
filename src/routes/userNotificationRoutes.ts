/**
 * @file User Notification Routes
 * @author eventFlow Team
 * @description Endpoint untuk notifikasi user (get, mark as read, unread count)
*/

import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  getListUnreadNotifications,
  getListReadNotifications,
  deleteUserNotificationById,
  markAllNotificationsRead,
  deleteAllNotificationByEvent,
  deleteAllNotificationForUser
} from '../controllers/userNotificationController';

const router = Router();

/**
 * @swagger
 * /notifications/markAll/read:
 *   post:
 *     summary: Tandai seluruh notifikasi user sebagai sudah dibaca
 *     tags: [UserNotification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifikasi ditandai sudah dibaca
 *       401:
 *         description: Unauthorized
 */
router.post('/notifications/markAll/read', markAllNotificationsRead);

/**
 * @swagger
 * /notifications/me:
 *   get:
 *     summary: Ambil semua notifikasi user
 *     tags: [UserNotification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List notifikasi user
 *       401:
 *         description: Unauthorized
*/
router.get('/notifications/me', getUserNotifications);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   post:
 *     summary: Tandai notifikasi user sebagai sudah dibaca
 *     tags: [UserNotification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID notifikasi
 *     responses:
 *       200:
 *         description: Notifikasi ditandai sudah dibaca
 *       401:
 *         description: Unauthorized
 */
router.post('/notifications/:notificationId/read', markNotificationRead);


/**
 * @swagger
 * /notifications/me/read:
 *   get:
 *     summary: Ambil jumlah notifikasi user yang belum dibaca
 *     tags: [UserNotification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jumlah notifikasi belum dibaca
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications/me/read', getListReadNotifications);

/**
 * @swagger
 * /notifications/me/unread:
 *   get:
 *     summary: Ambil jumlah notifikasi user yang belum dibaca
 *     tags: [UserNotification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jumlah notifikasi belum dibaca
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications/me/unread', getListUnreadNotifications);

/**
 * @swagger
 * /notifications/:notificationId/delete:
 *   delete:
 *     summary: Menghapus notifikasi user spesifik
 *     tags: [UserNotification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID notifikasi
 *     responses:
 *       200:
 *         description: Notifikasi telah terhapus!
 *       401:
 *         description: Unauthorized
 */
router.delete('/notifications/:notificationId/delete', deleteUserNotificationById);

/**
 * @swagger
 * /notifications/:eventId/delete:
 *   delete:
 *     summary: Menghapus notifikasi user berdasarkan event yang diikuti
 *     tags: [UserNotification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID notifikasi
 *     responses:
 *       200:
 *         description: Seluruh notifikasi dalam event ini telah terhapus!
 *       401:
 *         description: Unauthorized
 */
router.delete('/notifications/:eventId/delete', deleteAllNotificationByEvent);

/**
 * @swagger
 * /notifications/delete:
 *   delete:
 *     summary: Menghapus seluruh notifkasi user
 *     tags: [UserNotification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seluruh notifikasi telah terhapus!
 *       401:
 *         description: Unauthorized
 */
router.delete('/notifications/delete', deleteAllNotificationForUser);

export default router;
