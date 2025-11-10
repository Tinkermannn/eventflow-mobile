import { Request, Response } from 'express';
import { createVirtualArea as createVirtualAreaRepo, listVirtualAreas, updateVirtualArea as updateVirtualAreaRepo, deleteVirtualArea as deleteVirtualAreaRepo } from '../repositories/virtualAreaRepository';
import { baseResponse } from '../utils/baseResponse';
import { verifyJwt } from '../utils/jwt';

// const prisma = new PrismaClient();

export const createVirtualArea = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { id: eventId } = req.params;
  const { name, area, color } = req.body;
  if (!name || !area || !color) return res.status(400).json(baseResponse({ success: false, error: 'Missing fields' }));
  const virtualArea = await createVirtualAreaRepo({
    name,
    area,
    color,
    eventId
  });
  res.json(baseResponse({ success: true, data: virtualArea }));
};

export const getVirtualAreas = async (req: Request, res: Response) => {
  const { id: eventId } = req.params;
  const areas = await listVirtualAreas(eventId);
  res.json(baseResponse({ success: true, data: areas }));
};

export const updateVirtualArea = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { areaId } = req.params;
  const data = req.body;
  const virtualArea = await updateVirtualAreaRepo(areaId, data);
  res.json(baseResponse({ success: true, data: virtualArea }));
};

export const deleteVirtualArea = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { areaId } = req.params;
  await deleteVirtualAreaRepo(areaId);
  res.json(baseResponse({ success: true }));
};
