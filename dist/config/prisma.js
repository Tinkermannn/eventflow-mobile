"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
/**
 * File: prisma.ts
 * Author: eventFlow Team
 * Deskripsi: Konfigurasi dan inisialisasi Prisma Client untuk koneksi database PostgreSQL.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
