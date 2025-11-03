import { Request, Response, NextFunction } from 'express';
import locationService from '../services/location.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/helpers';
import { HTTP_STATUS } from '../utils/constants';

export class LocationController {
  /**
   * Update participant location
   * POST /api/v1/locations
   */
  updateLocation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { participantId, latitude, longitude, accuracy } = req.body;

    const location = await locationService.updateLocation({
      participantId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : undefined,
    });

    sendSuccess(
      res,
      location,
      'Location updated successfully',
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Batch update locations (for multiple participants)
   * POST /api/v1/locations/batch
   */
  batchUpdateLocations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { locations } = req.body;

    const result = await locationService.batchUpdateLocations(locations);

    sendSuccess(res, result, 'Locations updated successfully');
  });

  /**
   * Get latest location for participant
   * GET /api/v1/participants/:participantId/location
   */
  getLatestLocation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { participantId } = req.params;

    const location = await locationService.getLatestLocation(participantId);

    sendSuccess(res, location);
  });

  /**
   * Get location history
   * GET /api/v1/participants/:participantId/location/history
   */
  getLocationHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { participantId } = req.params;
    const { limit } = req.query;

    const history = await locationService.getLocationHistory(
      participantId,
      limit ? parseInt(limit as string) : undefined
    );

    sendSuccess(res, history);
  });

  /**
   * Get all latest locations for event
   * GET /api/v1/events/:eventId/locations
   */
  getEventLocations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;

    const locations = await locationService.getEventLocations(eventId);

    sendSuccess(res, locations);
  });

  /**
   * Get zone density (participant count in zone)
   * GET /api/v1/zones/:zoneId/density
   */
  getZoneDensity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { zoneId } = req.params;
    const { minutesAgo } = req.query;

    const count = await locationService.getZoneDensity(
      zoneId,
      minutesAgo ? parseInt(minutesAgo as string) : undefined
    );

    sendSuccess(res, { count });
  });
}

export default new LocationController();