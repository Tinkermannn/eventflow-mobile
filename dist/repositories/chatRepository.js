"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChatMessageForUser = exports.deleteChatMessage = exports.updateChatMessage = exports.getChatMessageById = exports.listChatMessagesForUser = exports.listChatMessages = exports.createChatMessage = void 0;
/**
 * File: chatRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk operasi database ChatMessage (group chat event, DM, dsb).
 * Dibuat: 2025-11-11
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
const prisma_1 = require("../config/prisma");
const createChatMessage = async (data) => {
    return prisma_1.prisma.chatMessage.create({ data });
};
exports.createChatMessage = createChatMessage;
const listChatMessages = async (eventId) => {
    return prisma_1.prisma.chatMessage.findMany({
        where: { eventId },
        orderBy: { createdAt: 'asc' },
    });
};
exports.listChatMessages = listChatMessages;
// Overload: listChatMessages with userId to exclude deleted messages
const listChatMessagesForUser = async (eventId, userId) => {
    const deleted = await prisma_1.prisma.chatMessageDelete.findMany({
        where: { userId },
        select: { chatMessageId: true }
    });
    const excludeIds = deleted.map(d => d.chatMessageId);
    return prisma_1.prisma.chatMessage.findMany({
        where: {
            eventId,
            NOT: { id: { in: excludeIds } }
        },
        orderBy: { createdAt: 'asc' }
    });
};
exports.listChatMessagesForUser = listChatMessagesForUser;
// Ambil pesan chat by id
const getChatMessageById = async (id) => {
    return prisma_1.prisma.chatMessage.findUnique({ where: { id } });
};
exports.getChatMessageById = getChatMessageById;
// Update pesan chat (edit pesan)
const updateChatMessage = async (id, data) => {
    return prisma_1.prisma.chatMessage.update({ where: { id }, data });
};
exports.updateChatMessage = updateChatMessage;
// Hapus pesan chat secara permanen (admin/panitia)
const deleteChatMessage = async (id) => {
    return prisma_1.prisma.chatMessage.delete({ where: { id } });
};
exports.deleteChatMessage = deleteChatMessage;
// Hapus pesan hanya untuk diri sendiri (soft delete)
// Implementasi: Insert ke tabel ChatMessageDelete
const deleteChatMessageForUser = async (chatMessageId, userId) => {
    return prisma_1.prisma.chatMessageDelete.create({
        data: { chatMessageId, userId }
    });
};
exports.deleteChatMessageForUser = deleteChatMessageForUser;
