"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateProfile = exports.getProfile = void 0;
const userRepository_1 = require("../repositories/userRepository");
const baseResponse_1 = require("../utils/baseResponse");
const baseResponse_2 = require("../utils/baseResponse");
const jwt_1 = require("../utils/jwt");
const cloudinary_1 = require("../utils/cloudinary");
const getProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const userRaw = await (0, userRepository_1.findUserById)(payload.userId);
        if (!userRaw)
            return res.status(404).json((0, baseResponse_2.errorResponse)('User not found'));
        // Map passwordHash and avatarUrl: null -> undefined for type compatibility
        const user = {
            ...userRaw,
            passwordHash: userRaw.passwordHash === null ? undefined : userRaw.passwordHash,
            avatarUrl: userRaw.avatarUrl === null ? undefined : userRaw.avatarUrl,
            phoneNumber: userRaw.phoneNumber === null ? undefined : userRaw.phoneNumber,
            googleId: userRaw.googleId === null ? undefined : userRaw.googleId,
        };
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: user }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { name, phoneNumber } = req.body;
        let avatarUrl = req.body.avatarUrl;
        // Jika ada file avatar yang diupload (via multer)
        if (req.file) {
            try {
                avatarUrl = await (0, cloudinary_1.uploadToCloudinary)(req.file.path);
            }
            catch (err) {
                console.error('Cloudinary upload error:', err);
                res.status(500).json((0, baseResponse_2.errorResponse)(err));
                return;
            }
        }
        const userRaw = await (0, userRepository_1.updateUser)(payload.userId, {
            name,
            phoneNumber,
            avatarUrl,
        });
        const user = {
            ...userRaw,
            passwordHash: userRaw.passwordHash === null ? undefined : userRaw.passwordHash,
            avatarUrl: userRaw.avatarUrl === null ? undefined : userRaw.avatarUrl,
            phoneNumber: userRaw.phoneNumber === null ? undefined : userRaw.phoneNumber,
            googleId: userRaw.googleId === null ? undefined : userRaw.googleId,
        };
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: user }));
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.updateProfile = updateProfile;
const deleteUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        await (0, userRepository_1.deleteUser)(payload.userId);
        res.json((0, baseResponse_1.baseResponse)({ success: true }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.deleteUser = deleteUser;
