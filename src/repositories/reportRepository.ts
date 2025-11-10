import { prisma } from '../config/prisma';

export const findReportById = async (id: string): Promise<any | null> => {
  return prisma.report.findUnique({ where: { id } });
};

export const listReports = async (eventId: string): Promise<any[]> => {
  return prisma.report.findMany({ where: { eventId } });
};

export const createReport = async (data: any): Promise<any> => {
  return prisma.report.create({ data });
};

export const updateReport = async (id: string, data: any): Promise<any> => {
  return prisma.report.update({ where: { id }, data });
};

export const deleteReport = async (id: string): Promise<any> => {
  return prisma.report.delete({ where: { id } });
};
