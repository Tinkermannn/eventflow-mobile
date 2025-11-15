"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("./jwt");
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
    if (!payload || typeof payload !== 'object' || !('userId' in payload))
        return res.status(401).json({ error: 'Unauthorized' });
    req.user = payload;
    next();
}
