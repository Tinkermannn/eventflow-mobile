import { EventStatus } from '@prisma/client';
import eventRepository from '../repositories/event.repository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { getPaginationMeta } from '../utils/helpers';

interface CreateEventInput {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  latitude: number;
  longitude: number;
  maxCapacity?: number;
  status?: EventStatus;
}

interface UpdateEventInput {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  maxCapacity?: number;
  status?: EventStatus;
}

interface ListEventsQuery {
  page?: number;
  limit?: number;
  status?: EventStatus;
  search?: string;
}

export class EventService {
  /**
   * Create new event
   */
  async createEvent(organizerId: string, data: CreateEventInput) {
    const event = await eventRepository.create({
      ...data,
      organizer: {
        connect: { id: organizerId },
      },
    });

    return event;
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    return event;
  }

  /**
   * Update event
   */
  async updateEvent(
    eventId: string,
    userId: string,
    userRole: string,
    data: UpdateEventInput
  ) {
    // Check if event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    // Check permission (only organizer or super admin can update)
    if (event.organizerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to update this event'
      );
    }

    // Update event
    const updatedEvent = await eventRepository.update(eventId, data);

    return updatedEvent;
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, userId: string, userRole: string) {
    // Check if event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    // Check permission
    if (event.organizerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to delete this event'
      );
    }

    // Delete event
    await eventRepository.delete(eventId);
  }

  /**
   * List events with pagination and filters
   */
  async listEvents(query: ListEventsQuery) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get events
    const { events, total } = await eventRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy: { startDate: 'desc' },
    });

    // Calculate pagination
    const pagination = getPaginationMeta(page, limit, total);

    return {
      events,
      pagination,
    };
  }

  /**
   * Get events by organizer
   */
  async getEventsByOrganizer(organizerId: string) {
    return await eventRepository.findByOrganizer(organizerId);
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10) {
    const { events } = await eventRepository.findAll({
      take: limit,
      where: {
        status: 'PUBLISHED',
        startDate: {
          gte: new Date(),
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return events;
  }

  /**
   * Get ongoing events
   */
  async getOngoingEvents() {
    const now = new Date();
    const { events } = await eventRepository.findAll({
      where: {
        status: 'ONGOING',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'asc' },
    });

    return events;
  }

  /**
   * Publish event
   */
  async publishEvent(eventId: string, userId: string, userRole: string) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    if (event.organizerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to publish this event'
      );
    }

    if (event.status !== 'DRAFT') {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'Only draft events can be published'
      );
    }

    return await eventRepository.update(eventId, {
      status: 'PUBLISHED',
    });
  }

  /**
   * Start event (set to ONGOING)
   */
  async startEvent(eventId: string, userId: string, userRole: string) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    if (event.organizerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to start this event'
      );
    }

    return await eventRepository.update(eventId, {
      status: 'ONGOING',
    });
  }

  /**
   * Complete event
   */
  async completeEvent(eventId: string, userId: string, userRole: string) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    if (event.organizerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to complete this event'
      );
    }

    return await eventRepository.update(eventId, {
      status: 'COMPLETED',
    });
  }
}

export default new EventService();