/**
 * File: eventParticipantRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query dan update data partisipan event di database.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
*/
import { prisma, EventParticipant } from '../config/prisma';

export const findEventParticipant = async (
  userId: string,
  eventId: string,
): Promise<EventParticipant | null> => {
  return prisma.eventParticipant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
};

export const listEventParticipants = async (
  eventId: string,
): Promise<EventParticipant[]> => {
  return prisma.eventParticipant.findMany({ where: { eventId } });
};
import { Prisma } from '@prisma/client';

export const createEventParticipant = async (data: Prisma.EventParticipantCreateInput): Promise<EventParticipant> => {
  return prisma.eventParticipant.create({ data });
};

export const updateEventParticipant = async (
  userId: string,
  eventId: string,
  data: Partial<EventParticipant>,
): Promise<EventParticipant> => {
  return prisma.eventParticipant.update({
    where: { userId_eventId: { userId, eventId } },
    data,
  });
};

export const deleteEventParticipant = async (
  userId: string,
  eventId: string,
): Promise<EventParticipant> => {
  return prisma.eventParticipant.delete({
    where: { userId_eventId: { userId, eventId } },
  });
};

// Hitung total peserta event
export const countEventParticipants = async (eventId: string): Promise<number> => {
  return prisma.eventParticipant.count({ where: { eventId } });
};