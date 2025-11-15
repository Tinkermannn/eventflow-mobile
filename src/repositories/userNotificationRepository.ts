/**
 * File: userNotificationRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk query dan update notifikasi user di database.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
 */
import { Prisma, prisma, UserNotification } from '../config/prisma';


export const listUserUnreadNotifications = async (
  userId: string,
): Promise<UserNotification[]> => {
  return prisma.userNotification.findMany({ where: { userId, isRead: false } });
};

export const listUserReadNotifications = async (
  userId: string,
): Promise<UserNotification[]> => {
  return prisma.userNotification.findMany({ where: { userId, isRead: true } });
};

export const findUserNotification = async (
  notificationId: string,
  userId: string,
): Promise<UserNotification | null> => {
  return prisma.userNotification.findUnique({
    where: { notificationId_userId: { notificationId, userId } },
  });
};

export const listUserNotifications = async (userId: string): Promise<UserNotification[]> => {
  return prisma.userNotification.findMany({ where: { userId } });
};

export const createUserNotification = async (data: Prisma.UserNotificationCreateInput): Promise<UserNotification> => {
  return prisma.userNotification.create({ data });
};



// Update single notification
export const updateUserNotification = async (
  notificationId: string,
  userId: string,
  data: Prisma.UserNotificationUpdateInput,
): Promise<UserNotification> => {
  return prisma.userNotification.update({
    where: { notificationId_userId: { notificationId, userId } },
    data,
  });
};

export const markAllNotificationsAsRead = async (
  userId: string
): Promise<number> => {
  const result = await prisma.userNotification.updateMany({
    where: { 
      userId, 
      isRead: false 
    },
    data: {
      isRead: true,
      readAt: new Date()
    },
  });
  return result.count;
};

export const deleteUserNotification = async (
  notificationId: string,
  userId: string,
): Promise<UserNotification> => {
  return prisma.userNotification.delete({
    where: { notificationId_userId: { notificationId, userId } },
  });
};

export const deleteAllUserNotificationEvent = async (userId: string, eventId: string): Promise<void> => {
  await prisma.userNotification.deleteMany({
    where: { userId,
      notification: {
        eventId,
      },
    },
  });
};;

export const deleteAllNotification = async (userId: string): Promise<void> => {
  await prisma.userNotification.deleteMany({
    where: { userId },
  });
};
