import { ReportCategory, ReportStatus } from '@prisma/client';
/**
 * File: reportController.ts
 * Author: eventFlow Team
 * Deskripsi: Enhanced controller untuk laporan dengan real-time broadcast dan notifikasi
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-15
 * Versi: 3.0.0
 * Lisensi: MIT
 * Dependensi: Express, Prisma, Cloudinary, JWT, Socket.io
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  createReport as createReportRepo,
  updateReport as updateReportRepo,
  deleteReport as deleteReportRepo,
  findReportById,
  listEventReportsForOrganizer,
  listEventReportsForParticipant,
  getReportStats,
  getUrgentReports,
  batchUpdateReportStatus
} from '../repositories/reportRepository';
import { baseResponse, errorResponse } from '../utils/baseResponse';
import { JWTPayload } from '../types/jwtPayload';
import { verifyJwt } from '../utils/jwt';
import { uploadToCloudinary } from '../utils/cloudinary';
import { 
  emitLiveReport, 
  emitNotification,
  emitEventBroadcast 
} from '../utils/socket';
import { createNotification } from '../repositories/notificationRepository';
import { isEventParticipant, isEventOrganizer } from '../repositories/eventRepository';

const prisma = new PrismaClient();

/**
 * Buat laporan baru dengan real-time notification ke organizer
 */
export const createReport = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { id: eventId } = req.params;
    const { category, description, latitude, longitude } = req.body;

    // Validasi input
    if (!category || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json(
        errorResponse('Semua field wajib diisi: category, description, latitude, longitude')
      );
    }

    // Validasi category
    const validCategories = ['SECURITY', 'CROWD', 'FACILITY', 'OTHER'];
    if (!validCategories.includes(category)) {
      return res.status(400).json(errorResponse('Kategori tidak valid'));
    }

    // Cek participant
    const isParticipant = await isEventParticipant(eventId, payload.userId);
    if (!isParticipant) {
      return res.status(403).json(
        errorResponse('Hanya participant event yang dapat membuat laporan')
      );
    }

    // Handle media uploads
    let mediaUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        try {
          const url = await uploadToCloudinary(file.path, 'reports');
          mediaUrls.push(url);
        } catch (err) {
          console.error('Upload media gagal:', err);
          return res.status(500).json(errorResponse('Upload media gagal'));
        }
      }
    } else if (req.body.mediaUrls) {
      mediaUrls = Array.isArray(req.body.mediaUrls)
        ? req.body.mediaUrls
        : [req.body.mediaUrls];
    }

    // Create report
    const report = await createReportRepo({
      category,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      reporter: { connect: { id: payload.userId } },
      event: { connect: { id: eventId } },
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    });

    // REAL-TIME: Emit ke organizer event
    emitLiveReport(eventId, {
      reportId: report.id,
      userId: payload.userId,
      message: `[${category}] ${description}`,
      mediaUrl: mediaUrls[0],
      createdAt: report.createdAt,
    });

    // Buat notifikasi untuk organizer
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { organizerId: true, name: true }
      });

      if (event) {
        const notif = await createNotification({
          title: `Laporan ${category}`,
          message: `${report.reporter.name}: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`,
          type: category === 'SECURITY' ? 'SECURITY_ALERT' : 'EVENT_UPDATE',
          eventId: eventId,
          category: category,
          userNotifications: {
            create: [{
              user: { connect: { id: event.organizerId } }
            }]
          }
        });

        // Emit notification real-time
        emitNotification({
          id: notif.id,
          title: `🚨 Laporan ${category}`,
          message: `${report.reporter.name}: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`,
          type: category === 'SECURITY' ? 'SECURITY_ALERT' : 'EVENT_UPDATE',
          eventId: eventId,
          category: category,
          createdAt: notif.createdAt
        });
      }
    } catch (notifError) {
      console.error('Gagal membuat notifikasi:', notifError);
    }

    res.status(201).json(baseResponse({ 
      success: true, 
      data: {
        id: report.id,
        category: report.category,
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
        status: report.status,
        mediaUrls: Array.isArray(report.mediaUrls) ? report.mediaUrls : [],
        reporter: report.reporter,
        createdAt: report.createdAt
      },
      message: 'Laporan berhasil dibuat dan dikirim ke organizer'
    }));
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unknown error'));
  }
};

/**
 * Get reports dengan filter untuk organizer/participant
 */
export const getReports = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { id: eventId } = req.params;
    const { category, status, startDate, endDate } = req.query;

    const isOrganizer = await isEventOrganizer(eventId, payload.userId);

    let categoryFilter: ReportCategory | undefined;
    let statusFilter: ReportStatus | undefined;

    if (category && Object.values(ReportCategory).includes(category as ReportCategory)) {
      categoryFilter = category as ReportCategory;
    }
    if (status && Object.values(ReportStatus).includes(status as ReportStatus)) {
      statusFilter = status as ReportStatus;
    }

    let reports;
    if (isOrganizer) {
      // Organizer dengan filters
      reports = await listEventReportsForOrganizer(eventId, {
        category: categoryFilter,
        status: statusFilter,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });
    } else {
      // Participant hanya lihat miliknya
      reports = await listEventReportsForParticipant(eventId, payload.userId);
    }

    const formattedReports = reports.map((r) => ({
      id: r.id,
      category: r.category,
      description: r.description,
      latitude: r.latitude,
      longitude: r.longitude,
      status: r.status,
      mediaUrls: Array.isArray(r.mediaUrls) ? r.mediaUrls : [],
      reporter: r.reporter,
      createdAt: r.createdAt
    }));

    res.json(baseResponse({ 
      success: true, 
      data: formattedReports,
      message: isOrganizer ? 'Semua laporan event' : 'Laporan Anda di event ini'
    }));
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unknown error'));
  }
};

/**
 * Update status report (hanya organizer)
 */
export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json(errorResponse('Status wajib diisi'));
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(errorResponse('Status tidak valid'));
    }

    const report = await findReportById(reportId);
    if (!report) {
      return res.status(404).json(errorResponse('Laporan tidak ditemukan'));
    }

    const isOrganizer = await isEventOrganizer(report.eventId, payload.userId);
    if (!isOrganizer) {
      return res.status(403).json(
        errorResponse('Hanya organizer event yang dapat mengupdate status laporan')
      );
    }

    interface UpdateData {
      status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
      adminNotes?: string;
    }

    const updateData: UpdateData = { status: status as UpdateData['status'] };
    if (adminNotes) updateData.adminNotes = adminNotes;

    const updatedReport = await updateReportRepo(reportId, updateData);

    // REAL-TIME: Emit status update
    emitLiveReport(report.eventId, {
      reportId: updatedReport.id,
      userId: 'system',
      message: `Status laporan diupdate: ${status}${adminNotes ? ` - ${adminNotes}` : ''}`,
      createdAt: new Date(),
    });

    // Notifikasi ke reporter
    const notif = await createNotification({
      title: 'Status Laporan Diupdate',
      message: `Laporan Anda tentang ${report.category} telah diupdate ke: ${status}`,
      type: 'EVENT_UPDATE',
      eventId: report.eventId,
      userNotifications: {
        create: [{
          user: { connect: { id: report.reporterId } }
        }]
      }
    });

    emitNotification({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      eventId: report.eventId,
      createdAt: notif.createdAt
    });

    res.json(baseResponse({ 
      success: true, 
      data: {
        id: updatedReport.id,
        status: updatedReport.status,
        adminNotes: adminNotes
      },
      message: `Status laporan berhasil diupdate menjadi ${status}`
    }));
  } catch (err) {
    console.error('Update report status error:', err);
    res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unknown error'));
  }
};

/**
 * BROADCAST report ke semua participants
 */
export const broadcastReport = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { reportId } = req.params;
    const { broadcastMessage, severity } = req.body; // severity: 'low' | 'medium' | 'high'

    const report = await findReportById(reportId);
    if (!report) {
      return res.status(404).json(errorResponse('Laporan tidak ditemukan'));
    }

    const isOrganizer = await isEventOrganizer(report.eventId, payload.userId);
    if (!isOrganizer) {
      return res.status(403).json(
        errorResponse('Hanya organizer yang dapat broadcast laporan')
      );
    }

    // Get all participants
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId: report.eventId },
      include: { user: true }
    });

    const title = `Pengumuman: ${report.category}`;
    const message = broadcastMessage || `${report.description.substring(0, 150)}${report.description.length > 150 ? '...' : ''}`;

    // Buat notifikasi broadcast
    const notification = await createNotification({
      title,
      message,
      type: 'BROADCAST',
      eventId: report.eventId,
      category: report.category,
      userNotifications: {
        create: participants.map((p) => ({
          user: { connect: { id: p.userId } }
        }))
      }
    });

    // REAL-TIME: Emit broadcast ke semua participants
    emitEventBroadcast(report.eventId, {
      id: notification.id,
      title,
      message,
      type: 'BROADCAST',
      eventId: report.eventId,
      category: report.category,
      createdAt: notification.createdAt
    });

    // Update report status
    await updateReportRepo(reportId, { 
      status: 'IN_PROGRESS'
    });

    res.json(baseResponse({ 
      success: true,
      data: {
        reportId: report.id,
        notificationId: notification.id,
        participantsCount: participants.length,
        severity
      },
      message: `Laporan berhasil di-broadcast ke ${participants.length} participants`
    }));
  } catch (err) {
    console.error('Broadcast report error:', err);
    res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unknown error'));
  }
};

/**
 * Hapus report
 */
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { reportId } = req.params;

    const report = await findReportById(reportId);
    if (!report) {
      return res.status(404).json(errorResponse('Laporan tidak ditemukan'));
    }

    const isOrganizer = await isEventOrganizer(report.eventId, payload.userId);
    const isReporter = report.reporterId === payload.userId;

    if (!isOrganizer && !isReporter) {
      return res.status(403).json(
        errorResponse('Anda tidak memiliki akses untuk menghapus laporan ini')
      );
    }

    await deleteReportRepo(reportId);

    res.json(baseResponse({ 
      success: true,
      message: 'Laporan berhasil dihapus'
    }));
  } catch (err) {
    console.error('Delete report error:', err);
    res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unknown error'));
  }
};

/**
 * Get report statistics (organizer only)
 */
export const getReportStatistics = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { id: eventId } = req.params;

    const isOrganizer = await isEventOrganizer(eventId, payload.userId);
    if (!isOrganizer) {
      return res.status(403).json(
        errorResponse('Hanya organizer yang dapat melihat statistik')
      );
    }

    const stats = await getReportStats(eventId);

    res.json(baseResponse({ 
      success: true,
      data: stats,
      message: 'Statistik laporan event'
    }));
  } catch (err) {
    console.error('Get report statistics error:', err);
    res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unknown error'));
  }
};

/**
 * 🚨 Get urgent reports (SECURITY yang PENDING)
 */
export const getUrgentReportsHandler = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { id: eventId } = req.params;

    const isOrganizer = await isEventOrganizer(eventId, payload.userId);
    if (!isOrganizer) {
      return res.status(403).json(
        errorResponse('Hanya organizer yang dapat melihat urgent reports')
      );
    }

    const urgentReports = await getUrgentReports(eventId);

    res.json(baseResponse({ 
      success: true,
      data: urgentReports.map(r => ({
        id: r.id,
        description: r.description,
        latitude: r.latitude,
        longitude: r.longitude,
        reporter: r.reporter,
        createdAt: r.createdAt,
        mediaUrls: Array.isArray(r.mediaUrls) ? r.mediaUrls : []
      })),
      message: `${urgentReports.length} laporan security yang memerlukan perhatian`
    }));
  } catch (err) {
    console.error('Get urgent reports error:', err);
    res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unknown error'));
  }
};

/**
 * Batch update report status
 */
export const batchUpdateStatus = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = token ? (verifyJwt(token) as JWTPayload) : null;
    if (!payload) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { reportIds, status } = req.body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json(errorResponse('reportIds wajib berupa array'));
    }

    if (!status || !['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json(errorResponse('Status tidak valid'));
    }

    type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

    // Verify organizer access for all reports
    const reports = await prisma.report.findMany({
      where: { id: { in: reportIds } },
      select: { id: true, eventId: true }
    });

    for (const report of reports) {
      const isOrganizer = await isEventOrganizer(report.eventId, payload.userId);
      if (!isOrganizer) {
        return res.status(403).json(
          errorResponse('Anda tidak memiliki akses untuk mengupdate beberapa laporan')
        );
      }
    }

    const count = await batchUpdateReportStatus(reportIds, status as ReportStatus);

    res.json(baseResponse({ 
      success: true,
      data: { updatedCount: count },
      message: `${count} laporan berhasil diupdate ke status ${status}`
    }));
  } catch (err) {
    console.error('Batch update status error:', err);
    res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unknown error'));
  }
};