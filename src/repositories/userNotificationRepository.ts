export const countUserUnreadNotifications = async (userId: string): Promise<number> => {
  return prisma.userNotification.count({ where: { userId, isRead: false } });
};
import { prisma } from '../config/prisma';

export const findUserNotification = async (notificationId: string, userId: string): Promise<any | null> => {
  return prisma.userNotification.findUnique({ where: { notificationId_userId: { notificationId, userId } } });
};

export const listUserNotifications = async (userId: string): Promise<any[]> => {
  return prisma.userNotification.findMany({ where: { userId } });
};

export const createUserNotification = async (data: any): Promise<any> => {
  return prisma.userNotification.create({ data });
};

export const updateUserNotification = async (notificationId: string, userId: string, data: any): Promise<any> => {
  return prisma.userNotification.update({ where: { notificationId_userId: { notificationId, userId } }, data });
};

export const deleteUserNotification = async (notificationId: string, userId: string): Promise<any> => {
  return prisma.userNotification.delete({ where: { notificationId_userId: { notificationId, userId } } });
};
