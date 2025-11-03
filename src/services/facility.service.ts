import facilityRepository from '../repositories/facility.repository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { FacilityType } from '@prisma/client';

interface CreateFacilityInput {
  eventId: string;
  name: string;
  type: FacilityType;
  description?: string;
  latitude: number;
  longitude: number;
  capacity?: number;
}

export class FacilityService {
    /**
     * Create new facility
     */
    async createFacility(data: CreateFacilityInput) {
        return await facilityRepository.create({
        event: {
            connect: { id: data.eventId }
        },
        name: data.name,
        type: data.type,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        //capacity: data.capacity,
        });
    }

    /**
     * Get all facilities
     */
    async getAllFacilities() {
        return await facilityRepository.findAll();
    }

    /**
     * Get facility by ID
     */
    async getFacilityById(id: string) {
        const facility = await facilityRepository.findById(id);
        if (!facility) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'Facility not found');
        }
        return facility;
    }

    /**
     * Update facility
     */
    async updateFacility(id: string, data: Partial<CreateFacilityInput>) {
        const facility = await this.getFacilityById(id);
        return await facilityRepository.update(id, data);
    }

    /**
     * Delete facility
     */
    async deleteFacility(id: string) {
        const facility = await this.getFacilityById(id);
        return await facilityRepository.delete(id);
    }

    /**
     * Get facilities by event
     */
    async getFacilitiesByEvent(eventId: string) {
        return await facilityRepository.findByEvent(eventId);
    }

    /**
     * Get nearby facilities (simple calculation)
     */
    async getNearbyFacilities(latitude: number, longitude: number, radius: number) {
        const allFacilities = await facilityRepository.findAll();
        
        // Simple distance calculation (Haversine formula would be better)
        return allFacilities.filter(facility => {
        const distance = this.calculateDistance(
            latitude,
            longitude,
            facility.latitude,
            facility.longitude
        );
        return distance <= radius;
        });
    }

    /**
     * Calculate distance between two points (simplified)
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }
}

export default new FacilityService();