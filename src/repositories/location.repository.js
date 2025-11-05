const prisma = require('../config/prisma.config');

exports.updateParticipantLocation = async (userId, eventId, latitude, longitude) => {
    // Menggunakan `upsert` untuk membuat data baru jika belum ada, atau update jika sudah ada
    return await prisma.participantLocation.upsert({
        where: {
            userId_eventId: { userId, eventId }
        },
        update: {
            latitude,
            longitude,
            lastUpdatedAt: new Date()
        },
        create: {
            userId,
            eventId,
            latitude,
            longitude
        }
    });
};

const locationRepository = require('../repositories/location.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.updateLocation = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const { latitude, longitude } = req.body;
        const userId = req.user.id; // Diambil dari token setelah melewati middleware `protect`

        if (latitude === undefined || longitude === undefined) {
            return baseResponse(res, false, 400, "Latitude and longitude are required", null);
        }

        // 1. Simpan/Update lokasi ke database
        const updatedLocation = await locationRepository.updateParticipantLocation(userId, eventId, latitude, longitude);

        // 2. Broadcast pembaruan lokasi ke room event yang sesuai via Socket.io
        const payload = {
            userId,
            latitude,
            longitude,
            lastUpdatedAt: updatedLocation.lastUpdatedAt
        };
        req.io.to(eventId).emit('locationUpdate', payload);

        // 3. Kirim response HTTP ke participant
        return baseResponse(res, true, 200, "Location updated successfully", updatedLocation);
    } catch (error) {
        next(error);
    }
};