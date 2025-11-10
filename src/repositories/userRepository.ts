import { prisma } from '../config/prisma';

export const findUserById = async (id: string): Promise<any | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const findUserByEmail = async (email: string): Promise<any | null> => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (data: any): Promise<any> => {
  return prisma.user.create({ data });
};

export const updateUser = async (id: string, data: any): Promise<any> => {
  return prisma.user.update({ where: { id }, data });
};

export const deleteUser = async (id: string): Promise<any> => {
  return prisma.user.delete({ where: { id } });
};
