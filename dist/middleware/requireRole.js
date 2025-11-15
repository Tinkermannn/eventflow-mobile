"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const prisma_1 = require("../config/prisma");
const jwt_1 = require("../utils/jwt");
const requireRole = (roles) => {
    return async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload || typeof payload !== 'object' || !('userId' in payload))
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient role' });
        }
        // Attach user info to request for downstream use
        req.user = user;
        next();
    };
};
exports.requireRole = requireRole;
