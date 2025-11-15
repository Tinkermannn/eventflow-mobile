
/**
 * @file Virtual Area Routes
 * @author eventFlow Team
 * @description Endpoint untuk manajemen area virtual event (CRUD geofence)
*/

import { Router } from 'express';
import {
  createVirtualArea,
  getVirtualAreas,
  updateVirtualArea,
  deleteVirtualArea,
  searchVirtualAreaByLocation,
  getVirtualAreaById
} from '../controllers/virtualAreaController';

import { requireAuth } from '../utils/requireAuth';


const router = Router();

/**
 * @swagger
 * /events/{id}/virtual-areas:
 *   post:
 *     summary: Buat area virtual (geofence) pada event
 *     tags: [VirtualArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - area
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *               area:
 *                 type: object
 *                 example:
 *                   type: Polygon
 *                   coordinates:
 *                     - [
 *                         [116.4858, -8.3885],
 *                         [116.4866, -8.3885],
 *                         [116.4866, -8.3891],
 *                         [116.4858, -8.3891],
 *                         [116.4858, -8.3885]
 *                       ]
 *               color:
 *                 type: string
 *                 example: "#1E90FF"
 *           example:
 *             name: Zona Registrasi Sembalun
 *             area:
 *               type: Polygon
 *               coordinates:
 *                 - [
 *                     [116.4858, -8.3885],
 *                     [116.4866, -8.3885],
 *                     [116.4866, -8.3891],
 *                     [116.4858, -8.3891],
 *                     [116.4858, -8.3885]
 *                   ]
 *             color: "#1E90FF"
 *     responses:
 *       200:
 *         description: Area virtual berhasil dibuat
 *       400:
 *         description: Data tidak lengkap
 *       401:
 *         description: Unauthorized
*/
router.post('/:id/virtual-areas', requireAuth, createVirtualArea);

/**
 * @swagger
 * /events/{id}/virtual-areas:
 *   get:
 *     summary: Ambil semua area virtual pada event
 *     tags: [VirtualArea]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     responses:
 *       200:
 *         description: List area virtual event
*/
router.get('/:id/virtual-areas', getVirtualAreas);

/**
 * @swagger
 * /events/{id}/virtual-areas/{areaId}:
 *   get:
 *     summary: Ambil area virtual tertentu pada event
 *     tags: [VirtualArea]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID area virtual
 *     responses:
 *       200:
 *         description: Area virtual ditemukan
 *       404:
 *         description: Area virtual tidak ditemukan
 */
router.get('/:id/virtual-areas/:areaId', getVirtualAreaById);

/**
 * @swagger
 * /events/{id}/virtual-areas/search:
 *   get:
 *     summary: Cari area virtual yang mengandung lokasi user (geofencing)
 *     tags: [VirtualArea]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude user
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude user
 *     responses:
 *       200:
 *         description: Area virtual yang mengandung lokasi user
 *       404:
 *         description: Tidak ada area yang mengandung lokasi
*/
router.get('/:id/virtual-areas/search', searchVirtualAreaByLocation);

/**
 * @swagger
 * /events/virtual-areas/{areaId}:
 *   patch:
 *     summary: Update area virtual event
 *     tags: [VirtualArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID area virtual
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Area virtual berhasil diupdate
 *       401:
 *         description: Unauthorized
 */
router.patch('/virtual-areas/:areaId', requireAuth, updateVirtualArea);

/**
 * @swagger
 * /events/virtual-areas/{areaId}:
 *   delete:
 *     summary: Hapus area virtual event
 *     tags: [VirtualArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID area virtual
 *     responses:
 *       200:
 *         description: Area virtual berhasil dihapus
 *       401:
 *         description: Unauthorized
 */
router.delete('/virtual-areas/:areaId', requireAuth, deleteVirtualArea);

export default router;
