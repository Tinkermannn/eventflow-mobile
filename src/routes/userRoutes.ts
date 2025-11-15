/**
 * @file User Routes
 * @author eventFlow Team
 * @description Endpoint untuk manajemen profil user (get, update, delete)
 */

import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  deleteUser,
} from '../controllers/userController';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

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
router.get('/me', getProfile);

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
router.patch('/me', upload.single('avatar'), updateProfile);

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
router.delete('/me', deleteUser);

export default router;
