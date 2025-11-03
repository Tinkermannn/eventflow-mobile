import { Request, Response, NextFunction } from 'express';
import reportService from '../services/report.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/helpers';
import { HTTP_STATUS } from '../utils/constants';
import { ReportStatus, ReportPriority } from '@prisma/client';

export class ReportController {
  /**
   * Create new report
   * POST /api/v1/reports
   */
  createReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, participantId, message, latitude, longitude } = req.body;
    const userId = req.userId; // Optional

    const report = await reportService.createReport({
      eventId,
      participantId,
      userId,
      message,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
    });

    sendSuccess(
      res,
      report,
      'Report created successfully',
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Get report by ID
   * GET /api/v1/reports/:id
   */
  getReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const report = await reportService.getReportById(id);

    sendSuccess(res, report);
  });

  /**
   * Update report status
   * PATCH /api/v1/reports/:id/status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const report = await reportService.updateStatus(id, status as ReportStatus);

    sendSuccess(res, report, 'Status updated successfully');
  });

  /**
   * Update report priority
   * PATCH /api/v1/reports/:id/priority
   */
  updatePriority = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { priority } = req.body;

    const report = await reportService.updatePriority(id, priority as ReportPriority);

    sendSuccess(res, report, 'Priority updated successfully');
  });

  /**
   * Get all reports for event
   * GET /api/v1/events/:eventId/reports
   */
  getEventReports = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;

    const reports = await reportService.getEventReports(eventId);

    sendSuccess(res, reports);
  });

  /**
   * Get emergency reports
   * GET /api/v1/events/:eventId/reports/emergency
   */
  getEmergencyReports = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;

    const reports = await reportService.getEmergencyReports(eventId);

    sendSuccess(res, reports);
  });
}

export default new ReportController();