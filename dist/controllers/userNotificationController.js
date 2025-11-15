"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllNotificationForUser = exports.deleteAllNotificationByEvent = exports.deleteUserNotificationById = exports.markAllNotificationsRead = exports.getListReadNotifications = exports.getListUnreadNotifications = exports.markNotificationRead = exports.getUserNotifications = void 0;
const userNotificationRepository_1 = require("../repositories/userNotificationRepository");
const notificationRepository_1 = require("../repositories/notificationRepository");
const baseResponse_1 = require("../utils/baseResponse");
const baseResponse_2 = require("../utils/baseResponse");
const jwt_1 = require("../utils/jwt");
// Get all notifications for current user
const getUserNotifications = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const userNotifications = await (0, userNotificationRepository_1.listUserNotifications)(payload.userId);
        // Map UserNotification to Notification type (fetch notification details)
        const notifications = await Promise.all(userNotifications.map(async (un) => {
            const notification = await (0, notificationRepository_1.findNotificationById)(un.notificationId);
            return notification
                ? {
                    ...notification,
                    eventId: notification.eventId ?? undefined,
                    category: notification.category ?? undefined,
                }
                : null;
        })).then(arr => arr.filter(n => n !== null));
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: notifications }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.getUserNotifications = getUserNotifications;
// Mark notification as read
const markNotificationRead = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { notificationId } = req.params;
        const updatedUserNotif = await (0, userNotificationRepository_1.updateUserNotification)(notificationId, payload.userId, { isRead: true, readAt: new Date() });
        const notification = await (0, notificationRepository_1.findNotificationById)(updatedUserNotif.notificationId);
        const updated = notification
            ? {
                ...notification,
                eventId: notification.eventId ?? undefined,
                category: notification.category ?? undefined,
            }
            : null;
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: updated }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.markNotificationRead = markNotificationRead;
// Get unread notification count
const getListUnreadNotifications = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const unreadNotifications = await (0, userNotificationRepository_1.listUserUnreadNotifications)(payload.userId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: { unreadNotifications } }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.getListUnreadNotifications = getListUnreadNotifications;
//get read
const getListReadNotifications = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const readNotifications = await (0, userNotificationRepository_1.listUserReadNotifications)(payload.userId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: { readNotifications } }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.getListReadNotifications = getListReadNotifications;
const markAllNotificationsRead = async (req, res) => {
    console.log('[markAllNotificationsRead] called');
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload) {
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        }
        console.log('[markAllNotificationsRead] userId:', payload.userId);
        // Panggil fungsi yang sudah diperbaiki
        const updatedCount = await (0, userNotificationRepository_1.markAllNotificationsAsRead)(payload.userId);
        console.log('[markAllNotificationsRead] updatedCount:', updatedCount);
        res.json((0, baseResponse_1.baseResponse)({
            success: true,
            data: {
                updatedCount
            }
        }));
    }
    catch (err) {
        console.error('[markAllNotificationsRead] error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
const deleteUserNotificationById = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { notificationId } = req.params;
        await (0, userNotificationRepository_1.deleteUserNotification)(notificationId, payload.userId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: null }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.deleteUserNotificationById = deleteUserNotificationById;
const deleteAllNotificationByEvent = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { eventId } = req.params;
        await (0, userNotificationRepository_1.deleteAllUserNotificationEvent)(payload.userId, eventId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: null }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.deleteAllNotificationByEvent = deleteAllNotificationByEvent;
const deleteAllNotificationForUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        await (0, userNotificationRepository_1.deleteAllNotification)(payload.userId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: null }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.deleteAllNotificationForUser = deleteAllNotificationForUser;
