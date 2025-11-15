"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.updateNotification = exports.createNotification = exports.listNotifications = exports.findNotificationById = void 0;
/**
 * File: notificationRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query, pembuatan, dan update notifikasi event/user di database.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
const prisma_1 = require("../config/prisma");
const findNotificationById = async (id) => {
    return prisma_1.prisma.notification.findUnique({ where: { id } });
};
exports.findNotificationById = findNotificationById;
const listNotifications = async (eventId) => {
    return prisma_1.prisma.notification.findMany({ where: { eventId } });
};
exports.listNotifications = listNotifications;
const createNotification = async (data) => {
    if (!data.eventId)
        throw new Error('eventId wajib diisi!');
    const { eventId, ...rest } = data;
    return prisma_1.prisma.notification.create({
        data: {
            ...rest,
            type: rest.type,
            event: { connect: { id: eventId } },
        },
    });
};
exports.createNotification = createNotification;
const updateNotification = async (id, data) => {
    return prisma_1.prisma.notification.update({ where: { id }, data });
};
exports.updateNotification = updateNotification;
const deleteNotification = async (id) => {
    return prisma_1.prisma.notification.delete({ where: { id } });
};
exports.deleteNotification = deleteNotification;
