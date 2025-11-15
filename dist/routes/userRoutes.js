"use strict";
/**
 * @file User Routes
 * @author eventFlow Team
 * @description Endpoint untuk manajemen profil user (get, update, delete)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = (0, express_1.Router)();
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Ambil profil user saat ini
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil user
 *       401:
 *         description: Unauthorized
 */
router.get('/me', userController_1.getProfile);
/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update profil user (support upload avatar)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: File avatar user (image)
 *     responses:
 *       200:
 *         description: Profil user berhasil diupdate
 *       401:
 *         description: Unauthorized
 */
router.patch('/me', upload.single('avatar'), userController_1.updateProfile);
/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Hapus user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       401:
 *         description: Unauthorized
 */
router.delete('/me', userController_1.deleteUser);
exports.default = router;
