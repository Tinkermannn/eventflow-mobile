import { prisma } from '../config/database';
import { Prisma, Event, EventStatus } from '@prisma/client';

export class EventRepository {
  /**
   * Create a new event
   */
  async create(data: Prisma.EventCreateInput): Promise<Event> {
    return await prisma.event.create({
      data,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<Event | null> {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        zones: true,
        facilities: true,
        _count: {
          select: {
            participants: true,
            reports: true,
          },
        },
      },
    });
  }

  /**
   * Update event
   */
  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return await prisma.event.update({
      where: { id },
      data,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete event
   */
  async delete(id: string): Promise<Event> {
    return await prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Find all events with pagination and filters
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              participants: true,
              zones: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  }

  /**
   * Find events by organizer
   */
  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return await prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            participants: true,
            zones: true,
          },
        },
      },
    });
  }

  /**
   * Check if user is event organizer
   */
  async isOrganizer(eventId: string, userId: string): Promise<boolean> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });
    
    return event?.organizerId === userId;
  }

  /**
   * Count events by status
   */
  async countByStatus(status: EventStatus): Promise<number> {
    return await prisma.event.count({
      where: { status },
    });
  }
}

export default new EventRepository();