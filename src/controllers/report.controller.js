const reportRepository = require('../repositories/report.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.createReport = async (req, res, next) => {
    try {
        const reporterId = req.user.id;
        const { eventId } = req.params;
        const { category, description, latitude, longitude } = req.body;

        if (!category || !description || !latitude || !longitude) {
            return baseResponse(res, false, 400, "Missing required report fields", null);
        }

        const newReport = await reportRepository.createReport({
            category, // Harus salah satu dari ENUM: 'SECURITY', 'CROWD', 'FACILITY', 'OTHER'
            description,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            reporterId,
            eventId
        });

        return baseResponse(res, true, 201, "Report submitted successfully", newReport);
    } catch (error) {
        next(error);
    }
};