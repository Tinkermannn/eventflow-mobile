export const findDevicesByUserId = async (userId: string): Promise<any[]> => {
  return prisma.device.findMany({ where: { userId } });
};
import { prisma } from '../config/prisma';

export const findDeviceById = async (id: string): Promise<any | null> => {
  return prisma.device.findUnique({ where: { id } });
};

export const findDeviceByPushToken = async (pushToken: string): Promise<any | null> => {
  return prisma.device.findUnique({ where: { pushToken } });
};

export const createDevice = async (data: any): Promise<any> => {
  return prisma.device.create({ data });
};

export const updateDevice = async (id: string, data: any): Promise<any> => {
  return prisma.device.update({ where: { id }, data });
};

export const deleteDevice = async (id: string): Promise<any> => {
  return prisma.device.delete({ where: { id } });
};
