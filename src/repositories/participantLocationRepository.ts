import { prisma } from '../config/prisma';

export const findParticipantLocation = async (userId: string, eventId: string): Promise<any | null> => {
  return prisma.participantLocation.findUnique({ where: { userId_eventId: { userId, eventId } } });
};

export const listParticipantLocations = async (eventId: string): Promise<any[]> => {
  return prisma.participantLocation.findMany({ where: { eventId } });
};

export const upsertParticipantLocation = async (userId: string, eventId: string, latitude: number, longitude: number): Promise<any> => {
  return prisma.participantLocation.upsert({
    where: { userId_eventId: { userId, eventId } },
    update: { latitude, longitude, lastUpdatedAt: new Date() },
    create: { userId, eventId, latitude, longitude },
  });
};
