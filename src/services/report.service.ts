import { ReportStatus, ReportPriority } from '@prisma/client';
import reportRepository from '../repositories/report.repository';
import eventRepository from '../repositories/event.repository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';

interface CreateReportInput {
  eventId: string;
  participantId?: string;
  userId?: string;
  message: string;
  latitude?: number;
  longitude?: number;
}

export class ReportService {
  /**
   * Create new report
   */
  async createReport(data: CreateReportInput) {
    const { eventId, ...reportData } = data;

    // Check if event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    // Auto-determine priority based on message keywords (simple implementation)
    const priority = this.determinePriority(data.message);

    // Create report
    const report = await reportRepository.create({
      ...reportData,
      event: { connect: { id: eventId } },
      participant: data.participantId
        ? { connect: { id: data.participantId } }
        : undefined,
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      priority,
      status: 'PENDING',
    });

    return report;
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId: string) {
    const report = await reportRepository.findById(reportId);
    
    if (!report) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Report not found');
    }

    return report;
  }

  /**
   * Update report status
   */
  async updateStatus(reportId: string, status: ReportStatus) {
    return await reportRepository.updateStatus(reportId, status);
  }

  /**
   * Update report priority
   */
  async updatePriority(reportId: string, priority: ReportPriority) {
    return await reportRepository.updatePriority(reportId, priority);
  }

  /**
   * Get all reports for event
   */
  async getEventReports(eventId: string) {
    return await reportRepository.findByEvent(eventId);
  }

  /**
   * Get emergency reports
   */
  async getEmergencyReports(eventId: string) {
    return await reportRepository.findByPriority(eventId, 'EMERGENCY');
  }

  /**
   * Determine priority from message (simple keyword-based)
   */
  private determinePriority(message: string): ReportPriority {
    const lowerMessage = message.toLowerCase();
    
    const emergencyKeywords = ['emergency', 'help', 'fire', 'attack', 'danger'];
    const highKeywords = ['urgent', 'critical', 'injured', 'medical'];
    const mediumKeywords = ['crowd', 'push', 'stuck', 'lost'];

    if (emergencyKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return 'EMERGENCY';
    }
    if (highKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return 'HIGH';
    }
    if (mediumKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}

export default new ReportService();