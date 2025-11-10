import { Request, Response } from 'express';
import { upsertParticipantLocation, listParticipantLocations, findParticipantLocation } from '../repositories/participantLocationRepository';
import { listVirtualAreas } from '../repositories/virtualAreaRepository';
import { baseResponse } from '../utils/baseResponse';
import { verifyJwt } from '../utils/jwt';
import { emitLocationUpdate } from '../utils/locationSocket';
import { isPointInPolygon } from '../utils/geo';
import { emitNotification } from '../utils/socket';

// Update participant location (POST /events/:eventId/location)
export const updateLocation = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { eventId } = req.params;
  const { latitude, longitude } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json(baseResponse({ success: false, error: 'Invalid coordinates' }));
  }
  const location = await upsertParticipantLocation(payload.userId, eventId, latitude, longitude);

  // Geofencing: cek apakah user masuk/keluar area
  const areas = await listVirtualAreas(eventId);
  const area = areas.length > 0 ? areas[0] : null;
  let geofenceStatus: 'inside' | 'outside' | null = null;
  if (area) {
    const inside = isPointInPolygon({ latitude, longitude }, area.area);
    geofenceStatus = inside ? 'inside' : 'outside';
    // Simpan status geofence di DB (opsional, jika ingin tracking)
    // Emit notifikasi jika status berubah (misal: masuk/keluar area)
    // Untuk demo, langsung emit notifikasi setiap update
    emitNotification({
      type: 'GEOFENCE',
      userId: payload.userId,
      eventId,
      areaId: area.id,
      status: geofenceStatus,
      latitude,
      longitude,
      message: `Peserta ${geofenceStatus === 'inside' ? 'masuk' : 'keluar'} area event`,
      createdAt: new Date()
    });
  }

  emitLocationUpdate(eventId, {
    userId: payload.userId,
    latitude,
    longitude,
    lastUpdatedAt: new Date()
  });
  res.json(baseResponse({ success: true, data: { location, geofenceStatus } }));
};

// Get all participant locations for an event (GET /events/:eventId/locations)
export const getEventLocations = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  // Repository only returns locations, not user info. For now, fallback to direct prisma for user info if needed.
  const locations = await listParticipantLocations(eventId);
  res.json(baseResponse({ success: true, data: locations }));
};

// Get location for current user in event (GET /events/:eventId/location/me)
export const getMyLocation = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { eventId } = req.params;
  const location = await findParticipantLocation(payload.userId, eventId);
  res.json(baseResponse({ success: true, data: location }));
};
