import participantRepository from '../repositories/participant.repository';
import eventRepository from '../repositories/event.repository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';

interface JoinEventInput {
  eventId: string;
  deviceId: string;
  userId?: string;
  name?: string;
  phone?: string;
}

export class ParticipantService {
  /**
   * Join event as participant
   */
  async joinEvent(data: JoinEventInput) {
    const { eventId, deviceId, userId, name, phone } = data;

    // Check if event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    // Check event status
    if (event.status !== 'PUBLISHED' && event.status !== 'ONGOING') {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'Event is not available for joining'
      );
    }

    // Check if device already joined
    const existingParticipant = await participantRepository.findByEventAndDevice(
      eventId,
      deviceId
    );

    if (existingParticipant) {
      // Reactivate if inactive
      if (!existingParticipant.isActive) {
        return await participantRepository.update(existingParticipant.id, {
          isActive: true,
          lastSeen: new Date(),
        });
      }
      return existingParticipant;
    }

    // Create new participant
    const participant = await participantRepository.create({
      event: { connect: { id: eventId } },
      deviceId,
      user: userId ? { connect: { id: userId } } : undefined,
      name,
      phone,
      isActive: true,
    });

    return participant;
  }

  /**
   * Leave event
   */
  async leaveEvent(participantId: string) {
    const participant = await participantRepository.findById(participantId);
    
    if (!participant) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Participant not found');
    }

    // Set inactive instead of deleting
    return await participantRepository.setActiveStatus(participantId, false);
  }

  /**
   * Get participant by ID
   */
  async getParticipantById(participantId: string) {
    const participant = await participantRepository.findById(participantId);
    
    if (!participant) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Participant not found');
    }

    return participant;
  }

  /**
   * Get participant by device ID
   */
  async getParticipantByDevice(deviceId: string) {
    const participant = await participantRepository.findByDeviceId(deviceId);
    
    if (!participant) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Participant not found');
    }

    return participant;
  }

  /**
   * Get all participants for event
   */
  async getEventParticipants(eventId: string) {
    return await participantRepository.findByEvent(eventId);
  }

  /**
   * Get active participants count
   */
  async getActiveCount(eventId: string) {
    return await participantRepository.countActiveByEvent(eventId);
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(participantId: string) {
    return await participantRepository.updateLastSeen(participantId);
  }
}

export default new ParticipantService();