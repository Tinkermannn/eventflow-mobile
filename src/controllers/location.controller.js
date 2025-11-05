// Mengimpor repository untuk berinteraksi dengan database
const locationRepository = require('../repositories/location.repository');
// Mengimpor utilitas response standar
const baseResponse = require('../utils/baseResponse.util');

/**
 * Controller untuk menerima dan memproses pembaruan lokasi dari partisipan.
 */
exports.updateLocation = async (req, res, next) => {
    try {
        // 1. Ekstrak data yang diperlukan dari request
        // eventId diambil dari parameter URL (e.g., /api/events/abc-123/location)
        const { eventId } = req.params;
        
        // latitude dan longitude diambil dari body request
        const { latitude, longitude } = req.body;

        // userId diambil dari token JWT yang sudah diverifikasi oleh middleware `protect`
        const userId = req.user.id;

        // 2. Validasi input
        // Pastikan frontend mengirimkan data koordinat
        if (latitude === undefined || longitude === undefined) {
            return baseResponse(res, false, 400, "Latitude and longitude are required", null);
        }

        // 3. Simpan atau perbarui lokasi ke database melalui repository
        // Repository akan menangani logika UPSERT (UPDATE jika ada, INSERT jika belum ada)
        const updatedLocation = await locationRepository.updateParticipantLocation(
            userId, 
            eventId, 
            parseFloat(latitude), 
            parseFloat(longitude)
        );

        // 4. Broadcast pembaruan lokasi ke semua organizer yang mendengarkan event ini
        //    Ini adalah langkah kunci untuk fungsionalitas real-time.
        const payload = {
            userId: userId,
            latitude: updatedLocation.latitude,
            longitude: updatedLocation.longitude,
            lastUpdatedAt: updatedLocation.lastUpdatedAt
        };

        // `req.io` adalah instance server Socket.io yang kita pasang di `index.js`
        // `.to(eventId)` memastikan pesan ini hanya dikirim ke "room" event yang spesifik.
        // `.emit('locationUpdate', payload)` mengirim event dengan nama 'locationUpdate'
        req.io.to(eventId).emit('locationUpdate', payload);

        // 5. Kirim response HTTP sukses kembali ke aplikasi partisipan yang mengirim lokasi
        return baseResponse(res, true, 200, "Location updated and broadcasted successfully", updatedLocation);

    } catch (error) {
        // Jika terjadi error, teruskan ke error handler global
        next(error);
    }
};