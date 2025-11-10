import { prisma } from '../config/prisma';

export const findEventById = async (id: string): Promise<any | null> => {
  return prisma.event.findUnique({ where: { id } });
};

export const listEvents = async (): Promise<any[]> => {
  return prisma.event.findMany();
};

export const createEvent = async (data: any): Promise<any> => {
  return prisma.event.create({ data });
};

export const updateEvent = async (id: string, data: any): Promise<any> => {
  return prisma.event.update({ where: { id }, data });
};

export const deleteEvent = async (id: string): Promise<any> => {
  return prisma.event.delete({ where: { id } });
};
