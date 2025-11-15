"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePollController = exports.getEventPollsController = exports.getUserVote = exports.unPollVote = exports.getPollResults = exports.submitVote = exports.createPollController = void 0;
const baseResponse_1 = require("../utils/baseResponse");
const baseResponse_2 = require("../utils/baseResponse");
const jwt_1 = require("../utils/jwt");
const socket_1 = require("../utils/socket");
const pollRepository_1 = require("../repositories/pollRepository");
const createPollController = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { eventId } = req.params;
        const { question, options } = req.body;
        if (!question || !Array.isArray(options) || options.length < 2)
            return res.status(400).json((0, baseResponse_2.errorResponse)('Pertanyaan dan minimal 2 opsi diperlukan'));
        const poll = await (0, pollRepository_1.createPoll)({ eventId, question, options });
        // Ambil poll beserta opsi dan statistik
        const pollWithStats = await (0, pollRepository_1.getPollWithVoteStats)(poll.id);
        if (!pollWithStats) {
            return res.status(404).json((0, baseResponse_2.errorResponse)('Poll tidak ditemukan setelah pembuatan'));
        }
        // Emit real-time event for new poll menggunakan utility yang sudah ada
        (0, socket_1.emitPollCreated)(eventId, {
            pollId: pollWithStats.id,
            question: pollWithStats.question,
            options: pollWithStats.options,
            eventId,
            createdAt: pollWithStats.createdAt
        });
        res.json((0, baseResponse_1.baseResponse)({
            success: true,
            data: pollWithStats,
            message: 'Poll berhasil dibuat'
        }));
    }
    catch (err) {
        console.error('Create poll error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err instanceof Error ? err.message : 'Unknown error'));
    }
};
exports.createPollController = createPollController;
// Submit vote pada polling event
const submitVote = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { eventId, pollId } = req.params;
        const { pollOptionId } = req.body;
        if (!pollOptionId)
            return res.status(400).json((0, baseResponse_2.errorResponse)('Opsi voting kosong'));
        // Submit vote and get updated options
        const { vote, updatedOptions } = await (0, pollRepository_1.submitPollVote)({
            pollOptionId,
            userId: payload.userId,
        });
        // Get complete poll stats for real-time update
        const pollStats = await (0, pollRepository_1.getPollWithVoteStats)(pollId);
        // Emit real-time update to all clients in the event room menggunakan utility yang sudah ada
        (0, socket_1.emitVotingUpdate)(eventId, {
            pollId,
            options: updatedOptions,
            totalVotes: pollStats?.totalVotes || 0,
            userVoted: pollOptionId,
            userId: payload.userId
        });
        res.json((0, baseResponse_1.baseResponse)({
            success: true,
            data: {
                vote,
                options: updatedOptions,
                totalVotes: pollStats?.totalVotes || 0
            },
            message: 'Vote berhasil disimpan'
        }));
    }
    catch (err) {
        console.error('Submit vote error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err instanceof Error ? err.message : 'Unknown error'));
    }
};
exports.submitVote = submitVote;
// Ambil hasil polling event dengan statistik lengkap
const getPollResults = async (req, res) => {
    try {
        const { pollId } = req.params;
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        const userId = payload?.userId;
        const pollStats = await (0, pollRepository_1.getPollWithVoteStats)(pollId, userId);
        if (!pollStats) {
            return res.status(404).json((0, baseResponse_2.errorResponse)('Poll tidak ditemukan'));
        }
        res.json((0, baseResponse_1.baseResponse)({
            success: true,
            data: pollStats
        }));
    }
    catch (err) {
        console.error('Get poll results error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err instanceof Error ? err.message : 'Unknown error'));
    }
};
exports.getPollResults = getPollResults;
// Un-vote (hapus vote polling event)
const unPollVote = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { eventId, pollId } = req.params;
        // Delete vote and get updated options
        const { deletedCount, updatedOptions } = await (0, pollRepository_1.deletePollVote)(pollId, payload.userId);
        // Get complete poll stats for real-time update
        const pollStats = await (0, pollRepository_1.getPollWithVoteStats)(pollId);
        // Emit real-time update menggunakan utility yang sudah ada
        (0, socket_1.emitVotingUpdate)(eventId, {
            pollId,
            options: updatedOptions,
            totalVotes: pollStats?.totalVotes || 0,
            userVoted: null,
            userId: payload.userId
        });
        res.json((0, baseResponse_1.baseResponse)({
            success: true,
            data: {
                deletedCount,
                options: updatedOptions,
                totalVotes: pollStats?.totalVotes || 0
            },
            message: 'Vote berhasil dihapus'
        }));
    }
    catch (err) {
        console.error('Unvote error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err instanceof Error ? err.message : 'Unknown error'));
    }
};
exports.unPollVote = unPollVote;
// Get user's current vote in a poll
const getUserVote = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { pollId } = req.params;
        const userVote = await (0, pollRepository_1.getUserVoteInPoll)(pollId, payload.userId);
        res.json((0, baseResponse_1.baseResponse)({
            success: true,
            data: userVote
        }));
    }
    catch (err) {
        console.error('Get user vote error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err instanceof Error ? err.message : 'Unknown error'));
    }
};
exports.getUserVote = getUserVote;
const getEventPollsController = async (req, res) => {
    try {
        const { eventId } = req.params;
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        const userId = payload?.userId;
        if (!eventId)
            return res.status(400).json((0, baseResponse_2.errorResponse)('eventId wajib diisi'));
        const polls = await (0, pollRepository_1.getEventPolls)(eventId);
        // Enhance polls with user vote information
        const enhancedPolls = await Promise.all(polls.map(async (poll) => {
            const pollStats = await (0, pollRepository_1.getPollWithVoteStats)(poll.id, userId);
            return pollStats;
        }));
        res.json((0, baseResponse_1.baseResponse)({
            success: true,
            data: enhancedPolls
        }));
    }
    catch (err) {
        console.error('Get event polls error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err instanceof Error ? err.message : 'Unknown error'));
    }
};
exports.getEventPollsController = getEventPollsController;
// Delete poll by pollId
const deletePollController = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { pollId, eventId } = req.params;
        if (!pollId)
            return res.status(400).json((0, baseResponse_2.errorResponse)('pollId wajib diisi'));
        // Hanya perlu memeriksa apakah poll ada sebelum menghapus
        const pollExists = await (0, pollRepository_1.getPollWithVoteStats)(pollId);
        if (!pollExists) {
            return res.status(404).json((0, baseResponse_2.errorResponse)('Poll tidak ditemukan'));
        }
        await (0, pollRepository_1.deletePoll)(pollId);
        // Emit real-time event for poll deletion menggunakan utility yang sudah ada
        (0, socket_1.emitPollDeleted)(eventId, {
            pollId,
            eventId
        });
        res.json((0, baseResponse_1.baseResponse)({
            success: true,
            message: 'Poll berhasil dihapus'
        }));
    }
    catch (err) {
        console.error('Delete poll error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err instanceof Error ? err.message : 'Unknown error'));
    }
};
exports.deletePollController = deletePollController;
