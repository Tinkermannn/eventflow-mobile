"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countEventParticipants = exports.deleteEventParticipant = exports.unjoinEventParticipant = exports.createEventParticipant = exports.listEventParticipantHistory = exports.listEventParticipants = exports.findActiveEventParticipant = exports.isEventParticipant = void 0;
/**
 * File: eventParticipantRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query dan update data partisipan event di database.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
*/
const prisma_1 = require("../config/prisma");
// Cek apakah user adalah peserta aktif event
const isEventParticipant = async (eventId, userId) => {
    const participant = await prisma_1.prisma.eventParticipant.findFirst({
        where: { eventId, userId, isActive: true },
    });
    return !!participant;
};
exports.isEventParticipant = isEventParticipant;
// Cari record aktif (isActive = true) untuk user dan event
const findActiveEventParticipant = async (userId, eventId) => {
    return prisma_1.prisma.eventParticipant.findFirst({
        where: { userId, eventId, isActive: true },
    });
};
exports.findActiveEventParticipant = findActiveEventParticipant;
// List peserta aktif pada event
const listEventParticipants = async (eventId) => {
    return prisma_1.prisma.eventParticipant.findMany({ where: { eventId, isActive: true } });
};
exports.listEventParticipants = listEventParticipants;
// List history partisipasi user pada event (termasuk yang sudah unjoin)
const listEventParticipantHistory = async (userId, eventId) => {
    return prisma_1.prisma.eventParticipant.findMany({
        where: { userId, eventId },
        orderBy: { joinedAt: 'asc' }
    });
};
exports.listEventParticipantHistory = listEventParticipantHistory;
const createEventParticipant = async (data) => {
    return prisma_1.prisma.eventParticipant.create({ data });
};
exports.createEventParticipant = createEventParticipant;
// Update record aktif (unjoin)
const unjoinEventParticipant = async (userId, eventId) => {
    const active = await prisma_1.prisma.eventParticipant.findFirst({ where: { userId, eventId, isActive: true } });
    if (!active)
        return null;
    return prisma_1.prisma.eventParticipant.update({
        where: { id: active.id },
        data: { isActive: false, leftAt: new Date() },
    });
};
exports.unjoinEventParticipant = unjoinEventParticipant;
// Hapus record by id (jika memang perlu hapus fisik)
const deleteEventParticipant = async (id) => {
    return prisma_1.prisma.eventParticipant.delete({
        where: { id },
    });
};
exports.deleteEventParticipant = deleteEventParticipant;
// Hitung total peserta aktif event
const countEventParticipants = async (eventId) => {
    return prisma_1.prisma.eventParticipant.count({ where: { eventId, isActive: true } });
};
exports.countEventParticipants = countEventParticipants;
