import { prisma } from '../config/prisma';

export const findVirtualAreaById = async (id: string): Promise<any | null> => {
  return prisma.virtualArea.findUnique({ where: { id } });
};

export const listVirtualAreas = async (eventId: string): Promise<any[]> => {
  return prisma.virtualArea.findMany({ where: { eventId } });
};

export const createVirtualArea = async (data: any): Promise<any> => {
  return prisma.virtualArea.create({ data });
};

export const updateVirtualArea = async (id: string, data: any): Promise<any> => {
  return prisma.virtualArea.update({ where: { id }, data });
};

export const deleteVirtualArea = async (id: string): Promise<any> => {
  return prisma.virtualArea.delete({ where: { id } });
};
