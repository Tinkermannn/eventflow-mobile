import locationRepository from '../repositories/location.repository';
import participantRepository from '../repositories/participant.repository';
import zoneRepository from '../repositories/zone.repository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';

interface UpdateLocationInput {
  participantId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export class LocationService {
  /**
   * Update participant location
   */
  async updateLocation(data: UpdateLocationInput) {
    const { participantId, latitude, longitude, accuracy } = data;

    // Check if participant exists
    const participant = await participantRepository.findById(participantId);
    if (!participant) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Participant not found');
    }

    // Get event zones
    const zones = await zoneRepository.findByEvent(participant.eventId);

    // Determine which zone the location is in (simplified - should use PostGIS in production)
    let zoneId: string | undefined;
    for (const zone of zones) {
      if (this.isPointInZone(latitude, longitude, zone.polygon as any)) {
        zoneId = zone.id;
        break;
      }
    }

    // Create location record
    const location = await locationRepository.create({
      participant: { connect: { id: participantId } },
      latitude,
      longitude,
      accuracy,
      zone: zoneId ? { connect: { id: zoneId } } : undefined,
      timestamp: new Date(),
    });

    // Update participant last seen
    await participantRepository.updateLastSeen(participantId);

    return location;
  }

  /**
   * Batch update locations
   */
  async batchUpdateLocations(locations: UpdateLocationInput[]) {
    const records = locations.map((loc) => ({
      participantId: loc.participantId,
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      timestamp: new Date(),
    }));

    const count = await locationRepository.createMany(records);

    return { count };
  }

  /**
   * Get latest location for participant
   */
  async getLatestLocation(participantId: string) {
    const location = await locationRepository.getLatestByParticipant(participantId);
    
    if (!location) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'No location found');
    }

    return location;
  }

  /**
   * Get location history
   */
  async getLocationHistory(participantId: string, limit: number = 100) {
    return await locationRepository.getHistoryByParticipant(participantId, limit);
  }

  /**
   * Get all latest locations for event
   */
  async getEventLocations(eventId: string) {
    return await locationRepository.getLatestLocationsByEvent(eventId);
  }

  /**
   * Get zone density (count participants in zone)
   */
  async getZoneDensity(zoneId: string, minutesAgo: number = 5) {
    return await locationRepository.countParticipantsInZone(zoneId, minutesAgo);
  }

  /**
   * Check if point is in zone polygon (simplified)
   * In production, use PostGIS ST_Contains
   */
  private isPointInZone(lat: number, lng: number, polygon: any): boolean {
    // TODO: Implement proper point-in-polygon algorithm
    // For now, return false (will be implemented later with PostGIS)
    return false;
  }

  /**
   * Cleanup old location records
   */
  async cleanupOldLocations(days: number = 30) {
    return await locationRepository.deleteOlderThan(days);
  }
}

export default new LocationService();