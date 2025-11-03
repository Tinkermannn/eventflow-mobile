import { Facility, Prisma } from '@prisma/client';
import  { prisma } from '../config/database';

export class FacilityRepository {
  /**
   * Create facility
   */
  async create(data: Prisma.FacilityCreateInput): Promise<Facility> {
    return await prisma.facility.create({
      data,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find all facilities
   */
  async findAll(): Promise<Facility[]> {
    return await prisma.facility.findMany({
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find facility by ID
   */
  async findById(id: string): Promise<Facility | null> {
    return await prisma.facility.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update facility
   */
  async update(id: string, data: Prisma.FacilityUpdateInput): Promise<Facility> {
    return await prisma.facility.update({
      where: { id },
      data,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete facility
   */
  async delete(id: string): Promise<Facility> {
    return await prisma.facility.delete({
      where: { id },
    });
  }

  /**
   * Find facilities by event
   */
  async findByEvent(eventId: string): Promise<Facility[]> {
    return await prisma.facility.findMany({
      where: { eventId },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

export default new FacilityRepository();