import { Request, Response, NextFunction } from 'express';
import participantService from '../services/participant.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/helpers';
import { HTTP_STATUS } from '../utils/constants';

export class ParticipantController {
  /**
   * Join event as participant
   * POST /api/v1/participants/join
   */
  joinEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, deviceId, name, phone } = req.body;
    const userId = req.userId; // Optional (can be null for anonymous)

    const participant = await participantService.joinEvent({
      eventId,
      deviceId,
      userId,
      name,
      phone,
    });

    sendSuccess(
      res,
      participant,
      'Successfully joined event',
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Leave event
   * POST /api/v1/participants/:id/leave
   */
  leaveEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await participantService.leaveEvent(id);

    sendSuccess(res, null, 'Successfully left event');
  });

  /**
   * Get participant by ID
   * GET /api/v1/participants/:id
   */
  getParticipant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const participant = await participantService.getParticipantById(id);

    sendSuccess(res, participant);
  });

  /**
   * Get participant by device ID
   * GET /api/v1/participants/device/:deviceId
   */
  getParticipantByDevice = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { deviceId } = req.params;

    const participant = await participantService.getParticipantByDevice(deviceId);

    sendSuccess(res, participant);
  });

  /**
   * Get all participants for event
   * GET /api/v1/events/:eventId/participants
   */
  getEventParticipants = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;

    const participants = await participantService.getEventParticipants(eventId);

    sendSuccess(res, participants);
  });

  /**
   * Get active participants count
   * GET /api/v1/events/:eventId/participants/count
   */
  getActiveCount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;

    const count = await participantService.getActiveCount(eventId);

    sendSuccess(res, { count });
  });

  /**
   * Update last seen (heartbeat)
   * POST /api/v1/participants/:id/heartbeat
   */
  updateLastSeen = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await participantService.updateLastSeen(id);

    sendSuccess(res, null, 'Heartbeat updated');
  });
}

export default new ParticipantController();