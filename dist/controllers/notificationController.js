"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventNotifications = exports.createBroadcast = void 0;
const notificationRepository_1 = require("../repositories/notificationRepository");
const userNotificationRepository_1 = require("../repositories/userNotificationRepository");
const prisma_1 = require("../config/prisma");
const baseResponse_1 = require("../utils/baseResponse");
const baseResponse_2 = require("../utils/baseResponse");
const jwt_1 = require("../utils/jwt");
const socket_1 = require("../utils/socket");
const eventRepository_1 = require("../repositories/eventRepository");
const createBroadcast = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { eventId, category, message, title, type } = req.body;
        if (!eventId || !message || !title)
            return res.status(400).json((0, baseResponse_2.errorResponse)('Missing fields'));
        // Validasi event dan hak broadcast
        const event = await (0, eventRepository_1.findEventById)(eventId);
        if (!event)
            return res.status(404).json((0, baseResponse_2.errorResponse)('Event not found'));
        if (event.organizerId !== payload.userId)
            return res.status(403).json((0, baseResponse_2.errorResponse)('Anda bukan organizer event ini'));
        // Validasi type agar hanya enum NotificationType
        const allowedTypes = ['GENERAL', 'EVENT_UPDATE', 'BROADCAST', 'SECURITY_ALERT'];
        const notifType = allowedTypes.includes(type) ? type : 'BROADCAST';
        // 1. Buat notifikasi event
        const prismaNotification = await (0, notificationRepository_1.createNotification)({
            eventId,
            category,
            message,
            title,
            type: notifType,
        });
        // 2. Ambil semua peserta event
        const participants = await prisma_1.prisma.eventParticipant.findMany({ where: { eventId } });
        // 3. Assign notifikasi ke semua peserta
        await Promise.all(participants.map(async (p) => {
            await (0, userNotificationRepository_1.createUserNotification)({
                notification: { connect: { id: prismaNotification.id } },
                user: { connect: { id: p.userId } },
            });
        }));
        const notification = {
            ...prismaNotification,
            eventId: prismaNotification.eventId ?? undefined,
            category: prismaNotification.category ?? undefined,
        };
        (0, socket_1.emitNotification)(notification);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: notification }));
    }
    catch (err) {
        next(err);
    }
};
exports.createBroadcast = createBroadcast;
const getEventNotifications = async (req, res, next) => {
    try {
        const { id: eventId } = req.params;
        if (!eventId)
            return res.status(400).json((0, baseResponse_2.errorResponse)('eventId wajib diisi'));
        const notifications = await (0, notificationRepository_1.listNotifications)(eventId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: notifications }));
    }
    catch (err) {
        next(err);
    }
};
exports.getEventNotifications = getEventNotifications;
