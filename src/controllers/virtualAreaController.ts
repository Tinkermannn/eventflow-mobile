/**
 * File: virtualAreaController.ts
 * Author: eventFlow Team
 * Deskripsi: Mengelola endpoint area virtual (geofence) event, termasuk pembuatan, update, pengambilan, dan penghapusan area.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Express, Prisma, JWT
*/
import { Request, Response } from 'express';
import {
  createVirtualArea as createVirtualAreaRepo,
  listVirtualAreas,
  updateVirtualArea as updateVirtualAreaRepo,
  deleteVirtualArea as deleteVirtualAreaRepo,
  searchVirtualAreaByLocation as searchVirtualAreaByLocationRepo,
  findVirtualAreaByEventAndId
} from '../repositories/virtualAreaRepository';
import { baseResponse } from '../utils/baseResponse';
import { errorResponse } from '../utils/baseResponse';
import { JWTPayload } from '../types/jwtPayload';
import { verifyJwt } from '../utils/jwt';


export const createVirtualArea = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload)
      return res.status(401).json(errorResponse('Unauthorized'));
    const { id: eventId } = req.params;
    const { name, area, color } = req.body;
    if (!name || !area || !color)
      return res.status(400).json(errorResponse('Missing fields'));
    // Pastikan area dikirim sebagai GeoJSON Polygon string
    if (!area.type || area.type !== 'Polygon' || !Array.isArray(area.coordinates)) {
      return res.status(400).json(errorResponse('Area must be valid GeoJSON Polygon'));
    }
    const created = await createVirtualAreaRepo({
      name,
      area: JSON.stringify(area), // Kirim sebagai string GeoJSON
      color,
      eventId
    });
    // area hasil dari repo diasumsikan string GeoJSON
    const virtualArea = {
      id: created.id,
      name: created.name,
      area: created.area ? (typeof created.area === 'string' ? JSON.parse(created.area) : created.area) : null,
      color: created.color,
      eventId: created.eventId,
    };
    res.json(baseResponse({ success: true, data: virtualArea }));
  } catch (err) {
    console.error('Create VirtualArea error:', err);
    res.status(500).json(errorResponse(err));
  }
};

export const getVirtualAreas = async (req: Request, res: Response) => {
  try {
    const { id: eventId } = req.params;
    const repoAreas = await listVirtualAreas(eventId);
    // Diasumsikan repo sudah mengembalikan area sebagai string GeoJSON
    const areas = repoAreas.map(a => ({
      id: a.id,
      name: a.name,
      area: a.area ? (typeof a.area === 'string' ? JSON.parse(a.area) : a.area) : null,
      color: a.color,
      eventId: a.eventId,
    }));
    res.json(baseResponse({ success: true, data: areas }));
  } catch (err) {
    res.status(500).json(errorResponse(err));
  }
};

export const getVirtualAreaById = async (req: Request, res: Response) => {
  try {
    const { id: eventId, areaId } = req.params;
    const area = await findVirtualAreaByEventAndId(eventId, areaId);
    if (!area) {
      return res.status(404).json(errorResponse('Area not found'));
    }
    const result = {
      id: area.id,
      name: area.name,
      area: area.area ? (typeof area.area === 'string' ? JSON.parse(area.area) : area.area) : null,
      color: area.color,
      eventId: area.eventId,
    };
    res.json(baseResponse({ success: true, data: result }));
  } catch (err) {
    res.status(500).json(errorResponse(err));
  }
};

export const searchVirtualAreaByLocation = async (req: Request, res: Response) => {
  try {
    const { id: eventId } = req.params;
    const { latitude, longitude } = req.query;
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json(errorResponse('Invalid latitude/longitude'));
    }
    const area = await searchVirtualAreaByLocationRepo(eventId, lat, lon);
    if (!area) {
      return res.status(404).json(errorResponse('No area contains this location'));
    }
    // area.area diasumsikan string GeoJSON
    const result = {
      id: area.id,
      name: area.name,
      area: area.area ? (typeof area.area === 'string' ? JSON.parse(area.area) : area.area) : null,
      color: area.color,
      eventId: area.eventId,
    };
    res.json(baseResponse({ success: true, data: result }));
  } catch (err) {
    res.status(500).json(errorResponse(err));
  }
};

export const updateVirtualArea = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload)
      return res.status(401).json(errorResponse('Unauthorized'));
    const { areaId } = req.params;
    const data = req.body;
    let updateData = { ...data };
    if (data.area) {
      if (!data.area.type || data.area.type !== 'Polygon' || !Array.isArray(data.area.coordinates)) {
        return res.status(400).json(errorResponse('Area must be valid GeoJSON Polygon'));
      }
      updateData.area = JSON.stringify(data.area);
    }
    const updated = await updateVirtualAreaRepo(areaId, updateData);
    const virtualArea = {
      id: updated.id,
      name: updated.name,
      area: updated.area ? (typeof updated.area === 'string' ? JSON.parse(updated.area) : updated.area) : null,
      color: updated.color,
      eventId: updated.eventId,
    };
    res.json(baseResponse({ success: true, data: virtualArea }));
  } catch (err) {
    console.error('Update VirtualArea error:', err);
    res.status(500).json(errorResponse(err));
  }
};

export const deleteVirtualArea = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload)
      return res.status(401).json(errorResponse('Unauthorized'));
    const { areaId } = req.params;
    await deleteVirtualAreaRepo(areaId);
    res.json(baseResponse({ success: true }));
  } catch (err) {
    res.status(500).json(errorResponse(err));
  }
};
