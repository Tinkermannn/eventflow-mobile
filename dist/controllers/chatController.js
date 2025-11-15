"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupChat = exports.deleteGroupChatForUser = exports.deleteGroupChat = exports.updateGroupChat = exports.sendGroupChat = void 0;
const baseResponse_1 = require("../utils/baseResponse");
const baseResponse_2 = require("../utils/baseResponse");
const jwt_1 = require("../utils/jwt");
const socket_1 = require("../utils/socket");
const chatRepository_1 = require("../repositories/chatRepository");
// Kirim pesan chat grup event
const sendGroupChat = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { eventId } = req.params;
        const { message } = req.body;
        if (!message)
            return res.status(400).json((0, baseResponse_2.errorResponse)('Pesan kosong'));
        const chat = {
            id: '', // assign real id if available
            eventId,
            user: {
                id: payload.userId,
                email: '',
                name: '',
                role: 'PARTICIPANT',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            message,
            createdAt: new Date(),
            virtualAreaId: undefined,
        };
        const savedChat = await (0, chatRepository_1.createChatMessage)({
            eventId,
            userId: payload.userId,
            message,
        });
        chat.id = savedChat.id;
        chat.createdAt = savedChat.createdAt;
        (0, socket_1.emitChatMessage)(eventId, chat);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: chat }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.sendGroupChat = sendGroupChat;
// Update pesan chat (edit pesan)
const updateGroupChat = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
    try {
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { chatId } = req.params;
        const { message } = req.body;
        if (!message)
            return res.status(400).json((0, baseResponse_2.errorResponse)('Pesan kosong'));
        const chat = await (0, chatRepository_1.getChatMessageById)(chatId);
        if (!chat || chat.userId !== payload.userId)
            return res.status(403).json((0, baseResponse_2.errorResponse)('Forbidden'));
        const updated = await (0, chatRepository_1.updateChatMessage)(chatId, { message });
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: updated }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.updateGroupChat = updateGroupChat;
// Hapus pesan chat secara permanen (admin/panitia)
const deleteGroupChat = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
    try {
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { chatId } = req.params;
        // TODO: Validasi role admin/panitia jika diperlukan
        await (0, chatRepository_1.deleteChatMessage)(chatId);
        res.json((0, baseResponse_1.baseResponse)({ success: true }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.deleteGroupChat = deleteGroupChat;
// Hapus pesan hanya untuk diri sendiri (soft delete)
const deleteGroupChatForUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
    try {
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { chatId } = req.params;
        await (0, chatRepository_1.deleteChatMessageForUser)(chatId, payload.userId);
        res.json((0, baseResponse_1.baseResponse)({ success: true }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.deleteGroupChatForUser = deleteGroupChatForUser;
// Ambil semua pesan chat grup event
const getGroupChat = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        const { eventId } = req.params;
        const chats = payload
            ? await (0, chatRepository_1.listChatMessagesForUser)(eventId, payload.userId)
            : await (0, chatRepository_1.listChatMessages)(eventId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: chats }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.getGroupChat = getGroupChat;
