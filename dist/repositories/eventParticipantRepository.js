"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countEventParticipants = exports.deleteEventParticipant = exports.updateEventParticipant = exports.createEventParticipant = exports.listEventParticipants = exports.findEventParticipant = void 0;
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
const findEventParticipant = async (userId, eventId) => {
    return prisma_1.prisma.eventParticipant.findUnique({
        where: { userId_eventId: { userId, eventId } },
    });
};
exports.findEventParticipant = findEventParticipant;
const listEventParticipants = async (eventId) => {
    return prisma_1.prisma.eventParticipant.findMany({ where: { eventId } });
};
exports.listEventParticipants = listEventParticipants;
const createEventParticipant = async (data) => {
    return prisma_1.prisma.eventParticipant.create({ data });
};
exports.createEventParticipant = createEventParticipant;
const updateEventParticipant = async (userId, eventId, data) => {
    return prisma_1.prisma.eventParticipant.update({
        where: { userId_eventId: { userId, eventId } },
        data,
    });
};
exports.updateEventParticipant = updateEventParticipant;
const deleteEventParticipant = async (userId, eventId) => {
    return prisma_1.prisma.eventParticipant.delete({
        where: { userId_eventId: { userId, eventId } },
    });
};
exports.deleteEventParticipant = deleteEventParticipant;
// Hitung total peserta event
const countEventParticipants = async (eventId) => {
    return prisma_1.prisma.eventParticipant.count({ where: { eventId } });
};
exports.countEventParticipants = countEventParticipants;
