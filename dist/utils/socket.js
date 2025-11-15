"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.initializeSocketHandlers = exports.emitEventBroadcast = exports.emitLiveReport = exports.emitChatMessage = exports.emitPollDeleted = exports.emitPollCreated = exports.emitVotingUpdate = exports.emitEventUpdate = exports.emitGeofenceEvent = exports.emitAbsensiUpdate = exports.emitLocationUpdate = exports.emitNotification = exports.getIO = exports.getSocketInstance = exports.setSocketInstance = void 0;
let io = null;
const setSocketInstance = (instance) => {
    io = instance;
};
exports.setSocketInstance = setSocketInstance;
const getSocketInstance = () => {
    if (!io)
        throw new Error('Socket.io instance not set');
    return io;
};
exports.getSocketInstance = getSocketInstance;
const getIO = () => {
    return io;
};
exports.getIO = getIO;
// Emit broadcast notification to all clients
/**
 * Emit broadcast notification to all clients
 * @param payload EventFullNotification | Notification
 */
const emitNotification = (payload) => {
    if (!io)
        return;
    io.emit('notification', payload);
};
exports.emitNotification = emitNotification;
/**
 * Emit update lokasi peserta ke semua client di event tertentu
 * @param eventId ID event
 * @param locationPayload Data lokasi peserta
 */
const emitLocationUpdate = (eventId, locationPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('locationUpdate', locationPayload);
};
exports.emitLocationUpdate = emitLocationUpdate;
/**
 * Emit status absensi peserta secara real-time
 * @param eventId ID event
 * @param absensiPayload Data absensi peserta
 */
const emitAbsensiUpdate = (eventId, absensiPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('absensiUpdate', absensiPayload);
};
exports.emitAbsensiUpdate = emitAbsensiUpdate;
/**
 * Emit deteksi masuk/keluar area virtual (geofence)
 * @param eventId ID event
 * @param geofencePayload Data geofence (masuk/keluar area)
 */
const emitGeofenceEvent = (eventId, geofencePayload) => {
    if (!io)
        return;
    io.to(eventId).emit('geofenceEvent', geofencePayload);
};
exports.emitGeofenceEvent = emitGeofenceEvent;
/**
 * Emit perubahan data event (jadwal, detail, dsb) ke semua client
 * @param eventId ID event
 * @param eventPayload Data perubahan event
 */
const emitEventUpdate = (eventId, eventPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('eventUpdate', eventPayload);
};
exports.emitEventUpdate = emitEventUpdate;
/**
 * Emit update hasil voting/polling ke semua peserta event
 * @param eventId ID event
 * @param votingPayload Data hasil voting/polling
 */
const emitVotingUpdate = (eventId, votingPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('votingUpdate', votingPayload);
};
exports.emitVotingUpdate = emitVotingUpdate;
/**
 * Emit pembuatan poll baru ke semua peserta event
 * @param eventId ID event
 * @param pollPayload Data poll yang dibuat
 */
const emitPollCreated = (eventId, pollPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('pollCreated', pollPayload);
};
exports.emitPollCreated = emitPollCreated;
/**
 * Emit penghapusan poll ke semua peserta event
 * @param eventId ID event
 * @param pollPayload Data poll yang dihapus
 */
const emitPollDeleted = (eventId, pollPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('pollDeleted', pollPayload);
};
exports.emitPollDeleted = emitPollDeleted;
// Emit chat message ke semua client di event tertentu
const emitChatMessage = (eventId, chatPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('chatMessage', chatPayload);
};
exports.emitChatMessage = emitChatMessage;
// Emit live report (laporan kejadian/media) ke admin/panitia event
const emitLiveReport = (eventId, reportPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('liveReport', reportPayload);
};
exports.emitLiveReport = emitLiveReport;
// Emit broadcast info/pengumuman ke semua client di event tertentu
const emitEventBroadcast = (eventId, infoPayload) => {
    if (!io)
        return;
    io.to(eventId).emit('eventBroadcast', infoPayload);
};
exports.emitEventBroadcast = emitEventBroadcast;
// Socket event connection handling
const initializeSocketHandlers = () => {
    if (!io)
        return;
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        // Join event room for real-time updates
        socket.on('join_event', (eventId) => {
            socket.join(eventId);
            console.log(`User ${socket.id} joined event room: ${eventId}`);
        });
        // Leave event room
        socket.on('leave_event', (eventId) => {
            socket.leave(eventId);
            console.log(`User ${socket.id} left event room: ${eventId}`);
        });
        // Join poll room for specific poll updates
        socket.on('join_poll', (pollId) => {
            socket.join(`poll_${pollId}`);
            console.log(`User ${socket.id} joined poll room: ${pollId}`);
        });
        // Leave poll room
        socket.on('leave_poll', (pollId) => {
            socket.leave(`poll_${pollId}`);
            console.log(`User ${socket.id} left poll room: ${pollId}`);
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
exports.initializeSocketHandlers = initializeSocketHandlers;
exports.SOCKET_EVENTS = {
    LOCATION_UPDATED: 'locationUpdate',
    ABSENSI_UPDATED: 'absensiUpdate',
    GEOFENCE_EVENT: 'geofenceEvent',
    EVENT_UPDATED: 'eventUpdate',
    VOTE_UPDATED: 'votingUpdate',
    POLL_CREATED: 'pollCreated',
    POLL_DELETED: 'pollDeleted',
    CHAT_MESSAGE: 'chatMessage',
    LIVE_REPORT: 'liveReport',
    EVENT_BROADCAST: 'eventBroadcast',
    NOTIFICATION: 'notification',
};
