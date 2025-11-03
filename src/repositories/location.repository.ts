import { prisma } from '../config/database';
import { Prisma, ParticipantLocation } from '@prisma/client';

export class LocationRepository {
  /**
   * Create location record
   */
  async create(
    data: Prisma.ParticipantLocationCreateInput
  ): Promise<ParticipantLocation> {
    return await prisma.participantLocation.create({
      data,
    });
  }

  /**
   * Bulk create locations (for batch updates)
   */
  async createMany(
    data: Prisma.ParticipantLocationCreateManyInput[]
  ): Promise<number> {
    const result = await prisma.participantLocation.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Get latest location for participant
   */
  async getLatestByParticipant(
    participantId: string
  ): Promise<ParticipantLocation | null> {
    return await prisma.participantLocation.findFirst({
      where: { participantId },
      orderBy: { timestamp: 'desc' },
      include: {
        zone: true,
      },
    });
  }

  /**
   * Get location history for participant
   */
  async getHistoryByParticipant(
    participantId: string,
    limit: number = 100
  ): Promise<ParticipantLocation[]> {
    return await prisma.participantLocation.findMany({
      where: { participantId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        zone: true,
      },
    });
  }

  /**
   * Get all latest locations for event participants
   */
  async getLatestLocationsByEvent(eventId: string) {
    // Get all active participants
    const participants = await prisma.participant.findMany({
      where: {
        eventId,
        isActive: true,
      },
      select: { id: true },
    });

    const participantIds = participants.map((p) => p.id);

    // Get latest location for each participant
    const locations = await prisma.$queryRaw<ParticipantLocation[]>`
      SELECT DISTINCT ON ("participantId") *
      FROM "participant_locations"
      WHERE "participantId" IN (${Prisma.join(participantIds)})
      ORDER BY "participantId", "timestamp" DESC
    `;

    return locations;
  }

  /**
   * Get locations in zone
   */
  async getLocationsByZone(
    zoneId: string,
    limit: number = 100
  ): Promise<ParticipantLocation[]> {
    return await prisma.participantLocation.findMany({
      where: { zoneId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        participant: {
          select: {
            id: true,
            name: true,
            deviceId: true,
          },
        },
      },
    });
  }

  /**
   * Count participants in zone (recent locations)
   */
  async countParticipantsInZone(
    zoneId: string,
    minutesAgo: number = 5
  ): Promise<number> {
    const cutoffTime = new Date(Date.now() - minutesAgo * 60 * 1000);

    const result = await prisma.participantLocation.groupBy({
      by: ['participantId'],
      where: {
        zoneId,
        timestamp: {
          gte: cutoffTime,
        },
      },
      _count: {
        participantId: true,
      },
    });

    return result.length;
  }

  /**
   * Delete old location records (cleanup)
   */
  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await prisma.participantLocation.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

export default new LocationRepository();