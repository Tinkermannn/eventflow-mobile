"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyLocation = exports.getEventLocations = exports.updateLocation = void 0;
const participantLocationRepository_1 = require("../repositories/participantLocationRepository");
// import { listVirtualAreas } from '../repositories/virtualAreaRepository';
const baseResponse_1 = require("../utils/baseResponse");
const baseResponse_2 = require("../utils/baseResponse");
const jwt_1 = require("../utils/jwt");
const socket_1 = require("../utils/socket");
// import { emitNotification } from '../utils/socket';
// Update participant location (POST /events/:eventId/location)
const updateLocation = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { eventId } = req.params;
        const { latitude, longitude } = req.body;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json((0, baseResponse_2.errorResponse)('Invalid coordinates'));
        }
        const location = await (0, participantLocationRepository_1.upsertParticipantLocation)(payload.userId, eventId, latitude, longitude);
        // Map ParticipantLocation to EventParticipant for socket emit
        const locationPayload = {
            userId: payload.userId,
            eventId,
            joinedAt: new Date(),
            nodeColor: undefined,
            attendanceStatus: undefined,
        };
        (0, socket_1.emitLocationUpdate)(eventId, locationPayload);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: { location } }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.updateLocation = updateLocation;
// Get all participant locations for an event (GET /events/:eventId/locations)
const getEventLocations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const locations = await (0, participantLocationRepository_1.listParticipantLocations)(eventId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: locations }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.getEventLocations = getEventLocations;
// Get location for current user in event (GET /events/:eventId/location/me)
const getMyLocation = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { eventId } = req.params;
        const location = await (0, participantLocationRepository_1.findParticipantLocation)(payload.userId, eventId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: location }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.getMyLocation = getMyLocation;
