"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDevice = exports.updateDevice = exports.createDevice = exports.findDeviceByPushToken = exports.findDeviceById = exports.findDevicesByUserId = void 0;
/**
 * File: deviceRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query dan update data device user di database.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
const prisma_1 = require("../config/prisma");
const findDevicesByUserId = async (userId) => {
    return prisma_1.prisma.device.findMany({ where: { userId } });
};
exports.findDevicesByUserId = findDevicesByUserId;
const findDeviceById = async (id) => {
    return prisma_1.prisma.device.findUnique({ where: { id } });
};
exports.findDeviceById = findDeviceById;
const findDeviceByPushToken = async (pushToken) => {
    return prisma_1.prisma.device.findUnique({ where: { pushToken } });
};
exports.findDeviceByPushToken = findDeviceByPushToken;
const createDevice = async (data) => {
    return prisma_1.prisma.device.create({ data });
};
exports.createDevice = createDevice;
const updateDevice = async (id, data) => {
    return prisma_1.prisma.device.update({ where: { id }, data });
};
exports.updateDevice = updateDevice;
const deleteDevice = async (id) => {
    return prisma_1.prisma.device.delete({ where: { id } });
};
exports.deleteDevice = deleteDevice;
