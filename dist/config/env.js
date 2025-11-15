"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
/**
 * File: env.ts
 * Author: eventFlow Team
 * Deskripsi: Utility untuk membaca dan mengelola variabel lingkungan (environment variables) aplikasi.
 * Dibuat: 2025-11-11
 * Terakhir Diubah: 2025-11-11
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: dotenv
 */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    PORT: process.env.PORT || 4000,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
    SOCKET_IO_ORIGIN: process.env.SOCKET_IO_ORIGIN || '*',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};
