"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = void 0;
const prisma_1 = require("../config/prisma");
const baseResponse_1 = require("../utils/baseResponse");
const baseResponse_2 = require("../utils/baseResponse");
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const client = new google_auth_library_1.OAuth2Client(env_1.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken)
            return res.status(400).json((0, baseResponse_2.errorResponse)('Missing idToken'));
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken,
                audience: env_1.env.GOOGLE_CLIENT_ID,
            });
        }
        catch {
            return res.status(401).json((0, baseResponse_2.errorResponse)('Invalid Google token'));
        }
        const payload = ticket.getPayload();
        if (!payload?.sub || !payload?.email || !payload?.name) {
            return res.status(400).json((0, baseResponse_2.errorResponse)('Google token missing required fields'));
        }
        // Cari user berdasarkan googleId atau email
        let user = await prisma_1.prisma.user.findUnique({ where: { googleId: payload.sub } });
        if (!user) {
            user = await prisma_1.prisma.user.findUnique({ where: { email: payload.email } });
        }
        // Jika belum ada, buat user baru
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    googleId: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    avatarUrl: payload.picture || undefined,
                    role: 'PARTICIPANT',
                },
            });
        }
        else if (!user.googleId) {
            // Update googleId jika belum ada
            user = await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { googleId: payload.sub },
            });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, env_1.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: { token, user } }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.googleLogin = googleLogin;
