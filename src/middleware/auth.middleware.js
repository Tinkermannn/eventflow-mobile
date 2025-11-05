const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/baseResponse.util');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari header
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Simpan data user ke request (tanpa password)
            req.user = decoded; // Misal: { id: 'user-id', role: 'PARTICIPANT' }

            next();
        } catch (error) {
            return baseResponse(res, false, 401, "Not authorized, token failed", null);
        }
    }

    if (!token) {
        return baseResponse(res, false, 401, "Not authorized, no token", null);
    }
};

const isOrganizer = (req, res, next) => {
    if (req.user && req.user.role === 'ORGANIZER') {
        next();
    } else {
        return baseResponse(res, false, 403, "Forbidden. Organizer role required.", null);
    }
};


module.exports = { protect, isOrganizer };