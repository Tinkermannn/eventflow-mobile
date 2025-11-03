import { prisma } from '../config/database';
import { Prisma, Report, ReportStatus, ReportPriority } from '@prisma/client';

export class ReportRepository {
  /**
   * Create a new report
   */
  async create(data: Prisma.ReportCreateInput): Promise<Report> {
    return await prisma.report.create({
      data,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            deviceId: true,
          },
        },
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
   * Find report by ID
   */
  async findById(id: string): Promise<Report | null> {
    return await prisma.report.findUnique({
      where: { id },
      include: {
        event: true,
        participant: true,
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
   * Update report
   */
  async update(id: string, data: Prisma.ReportUpdateInput): Promise<Report> {
    return await prisma.report.update({
      where: { id },
      data,
      include: {
        event: true,
        participant: true,
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
   * Update report status
   */
  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    return await prisma.report.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Update report priority
   */
  async updatePriority(id: string, priority: ReportPriority): Promise<Report> {
    return await prisma.report.update({
      where: { id },
      data: { priority },
    });
  }

  /**
   * Delete report
   */
  async delete(id: string): Promise<Report> {
    return await prisma.report.delete({
      where: { id },
    });
  }

  /**
   * Find all reports by event
   */
  async findByEvent(eventId: string): Promise<Report[]> {
    return await prisma.report.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: {
        participant: {
          select: {
            id: true,
            name: true,
            deviceId: true,
          },
        },
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
   * Find reports by status
   */
  async findByStatus(
    eventId: string,
    status: ReportStatus
  ): Promise<Report[]> {
    return await prisma.report.findMany({
      where: {
        eventId,
        status,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find reports by priority
   */
  async findByPriority(
    eventId: string,
    priority: ReportPriority
  ): Promise<Report[]> {
    return await prisma.report.findMany({
      where: {
        eventId,
        priority,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Count reports by status
   */
  async countByStatus(eventId: string, status: ReportStatus): Promise<number> {
    return await prisma.report.count({
      where: {
        eventId,
        status,
      },
    });
  }

  /**
   * Count emergency reports
   */
  async countEmergency(eventId: string): Promise<number> {
    return await prisma.report.count({
      where: {
        eventId,
        priority: 'EMERGENCY',
        status: {
          in: ['PENDING', 'TRIAGED', 'IN_PROGRESS'],
        },
      },
    });
  }
}

export default new ReportRepository();