"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllNotification = exports.deleteAllUserNotificationEvent = exports.deleteUserNotification = exports.markAllNotificationsAsRead = exports.updateUserNotification = exports.createUserNotification = exports.listUserNotifications = exports.findUserNotification = exports.listUserReadNotifications = exports.listUserUnreadNotifications = void 0;
/**
 * File: userNotificationRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query dan update notifikasi user di database.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
const prisma_1 = require("../config/prisma");
const listUserUnreadNotifications = async (userId) => {
    return prisma_1.prisma.userNotification.findMany({ where: { userId, isRead: false } });
};
exports.listUserUnreadNotifications = listUserUnreadNotifications;
const listUserReadNotifications = async (userId) => {
    return prisma_1.prisma.userNotification.findMany({ where: { userId, isRead: true } });
};
exports.listUserReadNotifications = listUserReadNotifications;
const findUserNotification = async (notificationId, userId) => {
    return prisma_1.prisma.userNotification.findUnique({
        where: { notificationId_userId: { notificationId, userId } },
    });
};
exports.findUserNotification = findUserNotification;
const listUserNotifications = async (userId) => {
    return prisma_1.prisma.userNotification.findMany({ where: { userId } });
};
exports.listUserNotifications = listUserNotifications;
const createUserNotification = async (data) => {
    return prisma_1.prisma.userNotification.create({ data });
};
exports.createUserNotification = createUserNotification;
// Update single notification
const updateUserNotification = async (notificationId, userId, data) => {
    return prisma_1.prisma.userNotification.update({
        where: { notificationId_userId: { notificationId, userId } },
        data,
    });
};
exports.updateUserNotification = updateUserNotification;
const markAllNotificationsAsRead = async (userId) => {
    const result = await prisma_1.prisma.userNotification.updateMany({
        where: {
            userId,
            isRead: false
        },
        data: {
            isRead: true,
            readAt: new Date()
        },
    });
    return result.count;
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const deleteUserNotification = async (notificationId, userId) => {
    return prisma_1.prisma.userNotification.delete({
        where: { notificationId_userId: { notificationId, userId } },
    });
};
exports.deleteUserNotification = deleteUserNotification;
const deleteAllUserNotificationEvent = async (userId, eventId) => {
    await prisma_1.prisma.userNotification.deleteMany({
        where: { userId,
            notification: {
                eventId,
            },
        },
    });
};
exports.deleteAllUserNotificationEvent = deleteAllUserNotificationEvent;
;
const deleteAllNotification = async (userId) => {
    await prisma_1.prisma.userNotification.deleteMany({
        where: { userId },
    });
};
exports.deleteAllNotification = deleteAllNotification;
