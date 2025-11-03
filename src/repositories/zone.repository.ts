import { prisma } from '../config/database';
import { Prisma, Zone, ZoneRiskLevel } from '@prisma/client';

export class ZoneRepository {
  /**
   * Create a new zone
   */
  async create(data: Prisma.ZoneCreateInput): Promise<Zone> {
    return await prisma.zone.create({
      data,
    });
  }

  /**
   * Find zone by ID
   */
  async findById(id: string): Promise<Zone | null> {
    return await prisma.zone.findUnique({
      where: { id },
      include: {
        event: true,
        _count: {
          select: {
            locations: true,
          },
        },
      },
    });
  }

  /**
   * Update zone
   */
  async update(id: string, data: Prisma.ZoneUpdateInput): Promise<Zone> {
    return await prisma.zone.update({
      where: { id },
      data,
    });
  }

  /**
   * Update zone risk level
   */
  async updateRiskLevel(id: string, riskLevel: ZoneRiskLevel): Promise<Zone> {
    return await prisma.zone.update({
      where: { id },
      data: { riskLevel },
    });
  }

  /**
   * Delete zone
   */
  async delete(id: string): Promise<Zone> {
    return await prisma.zone.delete({
      where: { id },
    });
  }

  /**
   * Find all zones by event
   */
  async findByEvent(eventId: string): Promise<Zone[]> {
    return await prisma.zone.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find zones by risk level
   */
  async findByRiskLevel(
    eventId: string,
    riskLevel: ZoneRiskLevel
  ): Promise<Zone[]> {
    return await prisma.zone.findMany({
      where: {
        eventId,
        riskLevel,
      },
    });
  }

  /**
   * Count zones in event
   */
  async countByEvent(eventId: string): Promise<number> {
    return await prisma.zone.count({
      where: { eventId },
    });
  }
}

export default new ZoneRepository();