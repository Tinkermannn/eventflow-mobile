"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDevice = exports.getMyDevices = exports.registerDevice = void 0;
const deviceRepository_1 = require("../repositories/deviceRepository");
const baseResponse_1 = require("../utils/baseResponse");
const baseResponse_2 = require("../utils/baseResponse");
const jwt_1 = require("../utils/jwt");
// Register or update device push token
const registerDevice = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { pushToken } = req.body;
        if (!pushToken)
            return res.status(400).json((0, baseResponse_2.errorResponse)('Missing pushToken'));
        let device = await (0, deviceRepository_1.findDeviceByPushToken)(pushToken);
        if (device) {
            device = await (0, deviceRepository_1.updateDevice)(device.id, {
                userId: payload.userId,
                lastLoginAt: new Date(),
            });
        }
        else {
            device = await (0, deviceRepository_1.createDevice)({ userId: payload.userId, pushToken });
        }
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: device }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.registerDevice = registerDevice;
// Get all devices for current user
const getMyDevices = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const devices = await (0, deviceRepository_1.findDevicesByUserId)(payload.userId);
        res.json((0, baseResponse_1.baseResponse)({ success: true, data: devices }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.getMyDevices = getMyDevices;
// Delete device (logout)
const deleteDevice = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? (0, jwt_1.verifyJwt)(token) : null;
        if (!payload)
            return res.status(401).json((0, baseResponse_2.errorResponse)('Unauthorized'));
        const { deviceId } = req.params;
        await (0, deviceRepository_1.deleteDevice)(deviceId);
        res.json((0, baseResponse_1.baseResponse)({ success: true }));
    }
    catch (err) {
        res.status(500).json((0, baseResponse_2.errorResponse)(err));
    }
};
exports.deleteDevice = deleteDevice;
