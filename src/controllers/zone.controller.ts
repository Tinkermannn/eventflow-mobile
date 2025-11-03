import { Request, Response, NextFunction } from 'express';
import zoneService from '../services/zone.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/helpers';
import { HTTP_STATUS } from '../utils/constants';
import { ZoneRiskLevel } from '@prisma/client';

export class ZoneController {
  /**
   * Create new zone
   * POST /api/v1/zones
   */
  createZone = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const userRole = req.userRole!;
    const { eventId, name, description, polygon, capacity, color } = req.body;

    const zone = await zoneService.createZone(userId, userRole, {
      eventId,
      name,
      description,
      polygon,
      capacity: capacity ? parseInt(capacity) : undefined,
      color,
    });

    sendSuccess(
      res,
      zone,
      'Zone created successfully',
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Get zone by ID
   * GET /api/v1/zones/:id
   */
  getZone = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const zone = await zoneService.getZoneById(id);

    sendSuccess(res, zone);
  });

  /**
   * Update zone
   * PUT /api/v1/zones/:id
   */
  updateZone = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;
    const { name, description, polygon, riskLevel, capacity, color } = req.body;

    const zone = await zoneService.updateZone(id, userId, userRole, {
      name,
      description,
      polygon,
      riskLevel: riskLevel as ZoneRiskLevel,
      capacity: capacity ? parseInt(capacity) : undefined,
      color,
    });

    sendSuccess(res, zone, 'Zone updated successfully');
  });

  /**
   * Delete zone
   * DELETE /api/v1/zones/:id
   */
  deleteZone = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    await zoneService.deleteZone(id, userId, userRole);

    sendSuccess(res, null, 'Zone deleted successfully');
  });

  /**
   * Get all zones for event
   * GET /api/v1/events/:eventId/zones
   */
  getEventZones = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;

    const zones = await zoneService.getEventZones(eventId);

    sendSuccess(res, zones);
  });

  /**
   * Update zone risk level
   * PATCH /api/v1/zones/:id/risk-level
   */
  updateRiskLevel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;
    const { riskLevel } = req.body;

    const zone = await zoneService.updateRiskLevel(
      id,
      riskLevel as ZoneRiskLevel,
      userId,
      userRole
    );

    sendSuccess(res, zone, 'Risk level updated successfully');
  });

  /**
   * Get critical zones (HIGH or CRITICAL risk)
   * GET /api/v1/events/:eventId/zones/critical
   */
  getCriticalZones = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;

    const zones = await zoneService.getCriticalZones(eventId);

    sendSuccess(res, zones);
  });
}

export default new ZoneController();