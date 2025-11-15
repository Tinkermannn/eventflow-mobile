/**
 * File: deviceRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query dan update data device user di database.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
import { prisma, Device } from '../config/prisma';


export const findDevicesByUserId = async (userId: string): Promise<Device[]> => {
  return prisma.device.findMany({ where: { userId } });
};

export const findDeviceById = async (id: string): Promise<Device | null> => {
  return prisma.device.findUnique({ where: { id } });
};

export const findDeviceByPushToken = async (pushToken: string): Promise<Device | null> => {
  return prisma.device.findUnique({ where: { pushToken } });
};

export const createDevice = async (data: { userId: string; pushToken: string; lastLoginAt?: Date }): Promise<Device> => {
  return prisma.device.create({ data });
};

export const updateDevice = async (id: string, data: Partial<Device>): Promise<Device> => {
  return prisma.device.update({ where: { id }, data });
};

export const deleteDevice = async (id: string): Promise<Device> => {
  return prisma.device.delete({ where: { id } });
};
