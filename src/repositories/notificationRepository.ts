import { prisma } from '../config/prisma';

export const findNotificationById = async (id: string): Promise<any | null> => {
  return prisma.notification.findUnique({ where: { id } });
};

export const listNotifications = async (eventId: string): Promise<any[]> => {
  return prisma.notification.findMany({ where: { eventId } });
};

export const createNotification = async (data: any): Promise<any> => {
  return prisma.notification.create({ data });
};

export const updateNotification = async (id: string, data: any): Promise<any> => {
  return prisma.notification.update({ where: { id }, data });
};

export const deleteNotification = async (id: string): Promise<any> => {
  return prisma.notification.delete({ where: { id } });
};
