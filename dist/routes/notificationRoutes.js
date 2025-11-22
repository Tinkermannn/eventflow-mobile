"use strict";
/**
 * @file Notification Routes
 * @author eventFlow Team
 * @description Endpoint untuk notifikasi event dan user
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../utils/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const notificationController_1 = require("../controllers/notificationController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /notifications/broadcast:
 *   post:
 *     summary: Broadcast notifikasi ke event
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - message
 *               - title
 *             properties:
 *               eventId:
 *                 type: string
 *               category:
 *                 type: string
 *               message:
 *                 type: string
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notifikasi berhasil dibroadcast
 *       400:
 *         description: Data tidak lengkap
 *       401:
 *         description: Unauthorized
 */
router.post('/broadcast', requireAuth_1.requireAuth, (0, requireRole_1.requireRole)(['ORGANIZER']), notificationController_1.createBroadcast);
/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Ambil semua notifikasi pada suatu event tertentu
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     responses:
 *       200:
 *         description: List notifikasi user
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', requireAuth_1.requireAuth, notificationController_1.getEventNotifications);
exports.default = router;
