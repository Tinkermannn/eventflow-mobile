"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.findUserByEmail = exports.findUserById = void 0;
/**
 * File: userRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query dan update data user di database menggunakan Prisma.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
const prisma_1 = require("../config/prisma");
const findUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({ where: { id } });
};
exports.findUserById = findUserById;
const findUserByEmail = async (email) => {
    return prisma_1.prisma.user.findUnique({ where: { email } });
};
exports.findUserByEmail = findUserByEmail;
const createUser = async (data) => {
    return prisma_1.prisma.user.create({ data });
};
exports.createUser = createUser;
const updateUser = async (id, data) => {
    return prisma_1.prisma.user.update({ where: { id }, data });
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    return prisma_1.prisma.user.delete({ where: { id } });
};
exports.deleteUser = deleteUser;
