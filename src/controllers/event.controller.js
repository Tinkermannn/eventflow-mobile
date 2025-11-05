const eventRepository = require('../repositories/event.repository');
const baseResponse = require('../utils/baseResponse.util');
const { customAlphabet } = require('nanoid');

// Fungsi untuk generate kode unik
const generateJoinCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

exports.createEvent = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        const { name, description, startTime, endTime, locationName, latitude, longitude } = req.body;

        // Validasi input
        if (!name || !startTime || !endTime || !locationName || !latitude || !longitude) {
            return baseResponse(res, false, 400, "Missing required event fields", null);
        }

        const newEvent = await eventRepository.createEvent({
            name,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            locationName,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            joinCode: generateJoinCode(),
            organizerId
        });

        return baseResponse(res, true, 201, "Event created successfully", newEvent);
    } catch (error) {
        next(error);
    }
};

exports.joinEvent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { joinCode } = req.body;

        const event = await eventRepository.findEventByJoinCode(joinCode);
        if (!event) {
            return baseResponse(res, false, 404, "Event with this code not found", null);
        }

        const alreadyJoined = await eventRepository.isUserInEvent(userId, event.id);
        if (alreadyJoined) {
            return baseResponse(res, false, 409, "You have already joined this event", event);
        }

        await eventRepository.joinEvent(userId, event.id);
        return baseResponse(res, true, 200, "Successfully joined the event", event);
    } catch (error) {
        next(error);
    }
};

exports.getMyEvents = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const events = await eventRepository.findEventsByUser(userId);
        return baseResponse(res, true, 200, "Events fetched successfully", events);
    } catch (error) {
        next(error);
    }
};

exports.getEventDetails = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const event = await eventRepository.findEventDetails(eventId);
        if (!event) {
            return baseResponse(res, false, 404, "Event not found", null);
        }
        return baseResponse(res, true, 200, "Event details fetched successfully", event);
    } catch (error) {
        next(error);
    }
};