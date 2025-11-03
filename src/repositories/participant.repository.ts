import { prisma } from '../config/database';
import { Prisma, Participant } from '@prisma/client';

export class ParticipantRepository {
  /**
   * Create a new participant
   */
  async create(data: Prisma.ParticipantCreateInput): Promise<Participant> {
    return await prisma.participant.create({
      data,
    });
  }

  /**
   * Find participant by ID
   */
  async findById(id: string): Promise<Participant | null> {
    return await prisma.participant.findUnique({
      where: { id },
      include: {
        event: true,
        user: {
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
   * Find participant by device ID
   */
  async findByDeviceId(deviceId: string): Promise<Participant | null> {
    return await prisma.participant.findUnique({
      where: { deviceId },
      include: {
        event: true,
      },
    });
  }

  /**
   * Find participant by event and device
   */
  async findByEventAndDevice(
    eventId: string,
    deviceId: string
  ): Promise<Participant | null> {
    return await prisma.participant.findFirst({
      where: {
        eventId,
        deviceId,
      },
    });
  }

  /**
   * Update participant
   */
  async update(
    id: string,
    data: Prisma.ParticipantUpdateInput
  ): Promise<Participant> {
    return await prisma.participant.update({
      where: { id },
      data,
    });
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(id: string): Promise<Participant> {
    return await prisma.participant.update({
      where: { id },
      data: { lastSeen: new Date() },
    });
  }

  /**
   * Set participant active status
   */
  async setActiveStatus(id: string, isActive: boolean): Promise<Participant> {
    return await prisma.participant.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
   * Find all participants by event
   */
  async findByEvent(eventId: string): Promise<Participant[]> {
    return await prisma.participant.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Count active participants in event
   */
  async countActiveByEvent(eventId: string): Promise<number> {
    return await prisma.participant.count({
      where: {
        eventId,
        isActive: true,
      },
    });
  }

  /**
   * Delete participant
   */
  async delete(id: string): Promise<Participant> {
    return await prisma.participant.delete({
      where: { id },
    });
  }
}

export default new ParticipantRepository();