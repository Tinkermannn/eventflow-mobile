import { prisma } from '../config/prisma';

export const findEventParticipant = async (userId: string, eventId: string): Promise<any | null> => {
  return prisma.eventParticipant.findUnique({ where: { userId_eventId: { userId, eventId } } });
};

export const listEventParticipants = async (eventId: string): Promise<any[]> => {
  return prisma.eventParticipant.findMany({ where: { eventId } });
};

export const createEventParticipant = async (data: any): Promise<any> => {
  return prisma.eventParticipant.create({ data });
};

export const updateEventParticipant = async (userId: string, eventId: string, data: any): Promise<any> => {
  return prisma.eventParticipant.update({ where: { userId_eventId: { userId, eventId } }, data });
};

export const deleteEventParticipant = async (userId: string, eventId: string): Promise<any> => {
  return prisma.eventParticipant.delete({ where: { userId_eventId: { userId, eventId } } });
};
