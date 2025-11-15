/**
 * File: reportRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query, pembuatan, dan update laporan event dengan enhanced features
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-15
 * Versi: 3.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
import { PrismaClient, Report, Prisma, ReportStatus, ReportCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Type untuk Report dengan relasi
export type ReportWithRelations = Report & {
  reporter: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string | null;
    phoneNumber?: string | null;
  };
  event?: {
    id: string;
    name: string;
    organizerId: string;
  };
};

/**
 * Mencari report berdasarkan ID dengan detail lengkap
 */
export const findReportById = async (id: string): Promise<ReportWithRelations | null> => {
  return prisma.report.findUnique({ 
    where: { id },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          phoneNumber: true
        }
      },
      event: {
        select: {
          id: true,
          name: true,
          organizerId: true
        }
      }
    }
  });
};

/**
 * List semua reports di event (admin view)
 */
export const listReports = async (eventId: string): Promise<ReportWithRelations[]> => {
  return prisma.report.findMany({ 
    where: { eventId },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          phoneNumber: true
        }
      }
    },
    orderBy: [
      { status: 'asc' }, // PENDING first
      { createdAt: 'desc' }
    ]
  });
};

/**
 * List reports untuk organizer dengan prioritas
 */
export const listEventReportsForOrganizer = async (
  eventId: string,
  filters?: {
    category?: ReportCategory;
    status?: ReportStatus;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ReportWithRelations[]> => {
  const where: Prisma.ReportWhereInput = { 
    eventId,
    ...(filters?.category && { category: filters.category }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.startDate && filters?.endDate && {
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate
      }
    })
  };

  return prisma.report.findMany({ 
    where,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          phoneNumber: true
        }
      }
    },
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' }
    ]
  });
};

/**
 * List reports participant sendiri
 */
export const listEventReportsForParticipant = async (
  eventId: string, 
  userId: string
): Promise<ReportWithRelations[]> => {
  return prisma.report.findMany({ 
    where: { 
      eventId,
      reporterId: userId 
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Membuat report baru
 */
export const createReport = async (
  data: Prisma.ReportCreateInput
): Promise<ReportWithRelations> => {
  return prisma.report.create({ 
    data,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true
        }
      },
      event: {
        select: {
          id: true,
          name: true,
          organizerId: true
        }
      }
    }
  });
};

/**
 * Update report (status, notes, etc)
 */
export const updateReport = async (
  id: string, 
  data: Prisma.ReportUpdateInput
): Promise<ReportWithRelations> => {
  return prisma.report.update({ 
    where: { id }, 
    data,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      },
      event: {
        select: {
          id: true,
          name: true,
          organizerId: true
        }
      }
    }
  });
};

/**
 * Hapus report
 */
export const deleteReport = async (id: string): Promise<Report> => {
  return prisma.report.delete({ 
    where: { id }
  });
};

/**
 * Statistik report untuk dashboard organizer
 */
export const getReportStats = async (eventId: string) => {
  const [stats, total, recent] = await Promise.all([
    prisma.report.groupBy({
      by: ['category', 'status'],
      where: { eventId },
      _count: { id: true }
    }),
    prisma.report.count({ where: { eventId } }),
    prisma.report.count({
      where: {
        eventId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
  ]);

  // Aggregate by category
  const byCategory = stats.reduce((acc, stat) => {
    if (!acc[stat.category]) {
      acc[stat.category] = {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
      };
    }
    acc[stat.category].total += stat._count.id;
    acc[stat.category][
      stat.status.toLowerCase().replace('_', '') as 'pending' | 'inProgress' | 'resolved'
    ] = stat._count.id;
    return acc;
  }, {} as Record<string, { total: number; pending: number; inProgress: number; resolved: number }>);

  // Summary by status
  const summary = {
    total,
    pending: stats
      .filter(s => s.status === 'PENDING')
      .reduce((sum, s) => sum + s._count.id, 0),
    inProgress: stats
      .filter(s => s.status === 'IN_PROGRESS')
      .reduce((sum, s) => sum + s._count.id, 0),
    resolved: stats
      .filter(s => s.status === 'RESOLVED')
      .reduce((sum, s) => sum + s._count.id, 0),
    recent24h: recent
  };

  return {
    summary,
    byCategory
  };
};

/**
 * Get urgent reports (SECURITY category yang masih PENDING)
 */
export const getUrgentReports = async (eventId: string): Promise<ReportWithRelations[]> => {
  return prisma.report.findMany({
    where: {
      eventId,
      category: 'SECURITY',
      status: 'PENDING'
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          avatarUrl: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Batch update status multiple reports
 */
export const batchUpdateReportStatus = async (
  reportIds: string[],
  status: ReportStatus
): Promise<number> => {
  const result = await prisma.report.updateMany({
    where: {
      id: { in: reportIds }
    },
    data: { status }
  });
  
  return result.count;
};

/**
 * Get reports dalam radius tertentu (untuk spatial analysis)
 */
export const getReportsInRadius = async (
  eventId: string,
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Promise<ReportWithRelations[]> => {
  // Haversine formula approximation
  const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
  const lngDelta = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));

  return prisma.report.findMany({
    where: {
      eventId,
      latitude: {
        gte: centerLat - latDelta,
        lte: centerLat + latDelta
      },
      longitude: {
        gte: centerLng - lngDelta,
        lte: centerLng + lngDelta
      }
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};