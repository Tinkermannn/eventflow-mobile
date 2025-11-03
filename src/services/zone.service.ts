import { ZoneRiskLevel } from '@prisma/client';
import zoneRepository from '../repositories/zone.repository';
import eventRepository from '../repositories/event.repository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';

interface CreateZoneInput {
  eventId: string;
  name: string;
  description?: string;
  polygon: any; // GeoJSON polygon
  capacity?: number;
  color?: string;
}

interface UpdateZoneInput {
  name?: string;
  description?: string;
  polygon?: any;
  riskLevel?: ZoneRiskLevel;
  capacity?: number;
  color?: string;
}

export class ZoneService {
  /**
   * Create new zone
   */
  async createZone(userId: string, userRole: string, data: CreateZoneInput) {
    const { eventId, ...zoneData } = data;

    // Check if event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    // Check permission
    if (event.organizerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to create zones for this event'
      );
    }

    // Create zone
    const zone = await zoneRepository.create({
      ...zoneData,
      event: { connect: { id: eventId } },
    });

    return zone;
  }

  /**
   * Get zone by ID
   */
  async getZoneById(zoneId: string) {
    const zone = await zoneRepository.findById(zoneId);
    
    if (!zone) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Zone not found');
    }

    return zone;
  }

  /**
   * Update zone
   */
  async updateZone(
    zoneId: string,
    userId: string,
    userRole: string,
    data: UpdateZoneInput
  ) {
    // Get zone
    const zone = await zoneRepository.findById(zoneId);
    if (!zone) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Zone not found');
    }

    // Check permission
    const event = await eventRepository.findById(zone.eventId);
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    if (event.organizerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to update this zone'
      );
    }

    // Update zone
    const updatedZone = await zoneRepository.update(zoneId, data);

    return updatedZone;
  }

  /**
   * Delete zone
   */
  async deleteZone(zoneId: string, userId: string, userRole: string) {
    const zone = await zoneRepository.findById(zoneId);
    if (!zone) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Zone not found');
    }

    // Check permission
    const event = await eventRepository.findById(zone.eventId);
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    if (event.organizerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to delete this zone'
      );
    }

    await zoneRepository.delete(zoneId);
  }

  /**
   * Get all zones for event
   */
  async getEventZones(eventId: string) {
    return await zoneRepository.findByEvent(eventId);
  }

  /**
   * Update zone risk level
   */
  async updateRiskLevel(
    zoneId: string,
    riskLevel: ZoneRiskLevel,
    userId: string,
    userRole: string
  ) {
    const zone = await zoneRepository.findById(zoneId);
    if (!zone) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Zone not found');
    }

    // Check permission
    const event = await eventRepository.findById(zone.eventId);
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    if (
      event.organizerId !== userId &&
      userRole !== 'SUPER_ADMIN' &&
      userRole !== 'SECURITY_STAFF'
    ) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to update zone risk level'
      );
    }

    return await zoneRepository.updateRiskLevel(zoneId, riskLevel);
  }

  /**
   * Get critical zones (HIGH or CRITICAL risk)
   */
  async getCriticalZones(eventId: string) {
    const highRisk = await zoneRepository.findByRiskLevel(eventId, 'HIGH');
    const critical = await zoneRepository.findByRiskLevel(eventId, 'CRITICAL');
    
    return [...critical, ...highRisk];
  }
}

export default new ZoneService();