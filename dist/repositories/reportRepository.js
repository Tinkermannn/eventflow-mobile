"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportsInRadius = exports.batchUpdateReportStatus = exports.getUrgentReports = exports.getReportStats = exports.deleteReport = exports.updateReport = exports.createReport = exports.listEventReportsForParticipant = exports.listEventReportsForOrganizer = exports.listReports = exports.findReportById = void 0;
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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Mencari report berdasarkan ID dengan detail lengkap
 */
const findReportById = async (id) => {
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
exports.findReportById = findReportById;
/**
 * List semua reports di event (admin view)
 */
const listReports = async (eventId) => {
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
exports.listReports = listReports;
/**
 * List reports untuk organizer dengan prioritas
 */
const listEventReportsForOrganizer = async (eventId, filters) => {
    const where = {
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
exports.listEventReportsForOrganizer = listEventReportsForOrganizer;
/**
 * List reports participant sendiri
 */
const listEventReportsForParticipant = async (eventId, userId) => {
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
exports.listEventReportsForParticipant = listEventReportsForParticipant;
/**
 * Membuat report baru
 */
const createReport = async (data) => {
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
exports.createReport = createReport;
/**
 * Update report (status, notes, etc)
 */
const updateReport = async (id, data) => {
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
exports.updateReport = updateReport;
/**
 * Hapus report
 */
const deleteReport = async (id) => {
    return prisma.report.delete({
        where: { id }
    });
};
exports.deleteReport = deleteReport;
/**
 * Statistik report untuk dashboard organizer
 */
const getReportStats = async (eventId) => {
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
        acc[stat.category][stat.status.toLowerCase().replace('_', '')] = stat._count.id;
        return acc;
    }, {});
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
exports.getReportStats = getReportStats;
/**
 * Get urgent reports (SECURITY category yang masih PENDING)
 */
const getUrgentReports = async (eventId) => {
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
exports.getUrgentReports = getUrgentReports;
/**
 * Batch update status multiple reports
 */
const batchUpdateReportStatus = async (reportIds, status) => {
    const result = await prisma.report.updateMany({
        where: {
            id: { in: reportIds }
        },
        data: { status }
    });
    return result.count;
};
exports.batchUpdateReportStatus = batchUpdateReportStatus;
/**
 * Get reports dalam radius tertentu (untuk spatial analysis)
 */
const getReportsInRadius = async (eventId, centerLat, centerLng, radiusKm) => {
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
exports.getReportsInRadius = getReportsInRadius;
