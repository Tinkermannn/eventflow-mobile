import { Request, Response, NextFunction } from 'express';
import eventService from '../services/event.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/helpers';
import { HTTP_STATUS } from '../utils/constants';
import { EventStatus } from '@prisma/client';

export class EventController {
  /**
   * Create new event
   * POST /api/v1/events
   */
  createEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const organizerId = req.userId!;
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      latitude,
      longitude,
      maxCapacity,
      status,
    } = req.body;

    const event = await eventService.createEvent(organizerId, {
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
      status: status as EventStatus,
    });

    sendSuccess(
      res,
      event,
      'Event created successfully',
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Get event by ID
   * GET /api/v1/events/:id
   */
  getEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const event = await eventService.getEventById(id);

    sendSuccess(res, event);
  });

  /**
   * Update event
   * PUT /api/v1/events/:id
   */
  updateEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      latitude,
      longitude,
      maxCapacity,
      status,
    } = req.body;

    const event = await eventService.updateEvent(id, userId, userRole, {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
      status: status as EventStatus,
    });

    sendSuccess(res, event, 'Event updated successfully');
  });

  /**
   * Delete event
   * DELETE /api/v1/events/:id
   */
  deleteEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    await eventService.deleteEvent(id, userId, userRole);

    sendSuccess(res, null, 'Event deleted successfully');
  });

  /**
   * List all events with pagination
   * GET /api/v1/events
   */
  listEvents = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, status, search } = req.query;

    const result = await eventService.listEvents({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as EventStatus,
      search: search as string,
    });

    sendSuccess(res, result);
  });

  /**
   * Get my events (events I organize)
   * GET /api/v1/events/my-events
   */
  getMyEvents = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const organizerId = req.userId!;

    const events = await eventService.getEventsByOrganizer(organizerId);

    sendSuccess(res, events);
  });

  /**
   * Get upcoming events
   * GET /api/v1/events/upcoming
   */
  getUpcomingEvents = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { limit } = req.query;

    const events = await eventService.getUpcomingEvents(
      limit ? parseInt(limit as string) : undefined
    );

    sendSuccess(res, events);
  });

  /**
   * Get ongoing events
   * GET /api/v1/events/ongoing
   */
  getOngoingEvents = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const events = await eventService.getOngoingEvents();

    sendSuccess(res, events);
  });

  /**
   * Publish event
   * POST /api/v1/events/:id/publish
   */
  publishEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    const event = await eventService.publishEvent(id, userId, userRole);

    sendSuccess(res, event, 'Event published successfully');
  });

  /**
   * Start event
   * POST /api/v1/events/:id/start
   */
  startEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    const event = await eventService.startEvent(id, userId, userRole);

    sendSuccess(res, event, 'Event started successfully');
  });

  /**
   * Complete event
   * POST /api/v1/events/:id/complete
   */
  completeEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    const event = await eventService.completeEvent(id, userId, userRole);

    sendSuccess(res, event, 'Event completed successfully');
  });
}

export default new EventController();