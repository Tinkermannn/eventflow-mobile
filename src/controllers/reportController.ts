import { Request, Response } from 'express';
import { createReport as createReportRepo, listReports, updateReport as updateReportRepo, deleteReport as deleteReportRepo } from '../repositories/reportRepository';
import { baseResponse } from '../utils/baseResponse';
import { verifyJwt } from '../utils/jwt';


export const createReport = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { id: eventId } = req.params;
  const { category, description, latitude, longitude } = req.body;
  if (!category || !description || latitude === undefined || longitude === undefined) {
    return res.status(400).json(baseResponse({ success: false, error: 'Missing fields' }));
  }
  const report = await createReportRepo({
    category,
    description,
    latitude,
    longitude,
    reporterId: payload.userId,
    eventId
  });
  res.json(baseResponse({ success: true, data: report }));
};

export const getReports = async (req: Request, res: Response) => {
  const { id: eventId } = req.params;
  const reports = await listReports(eventId);
  res.json(baseResponse({ success: true, data: reports }));
};

export const updateReportStatus = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { reportId } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json(baseResponse({ success: false, error: 'Missing status' }));
  const report = await updateReportRepo(reportId, { status });
  res.json(baseResponse({ success: true, data: report }));
};

export const deleteReport = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { reportId } = req.params;
  await deleteReportRepo(reportId);
  res.json(baseResponse({ success: true }));
};
