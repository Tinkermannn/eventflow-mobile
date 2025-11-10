import { Request, Response } from 'express';
import {
  findEventById,
  listEvents as listEventsRepo,
  createEvent as createEventRepo,
  updateEvent as updateEventRepo,
  deleteEvent as deleteEventRepo
} from '../repositories/eventRepository';
import { baseResponse } from '../utils/baseResponse';
import { createEventParticipant } from '../repositories/eventParticipantRepository';
import { verifyJwt } from '../utils/jwt';

// const prisma = new PrismaClient();

export const createEvent = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { name, description, startTime, endTime, locationName, latitude, longitude, joinCode } = req.body;
  if (!name || !startTime || !endTime || !locationName || !latitude || !longitude || !joinCode) {
    return res.status(400).json(baseResponse({ success: false, error: 'Missing fields' }));
  }
  const event = await createEventRepo({
    name,
    description,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    locationName,
    latitude,
    longitude,
    joinCode,
    organizerId: payload.userId
  });
  res.json(baseResponse({ success: true, data: event }));
};

export const getEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await findEventById(id);
  if (!event) return res.status(404).json(baseResponse({ success: false, error: 'Event not found' }));
  res.json(baseResponse({ success: true, data: event }));
};

export const listEvents = async (req: Request, res: Response) => {
  const { status } = req.query;
  let events;
  if (status && typeof status === 'string') {
    events = await listEventsRepo();
    events = events.filter(e => e.status === status);
  } else {
    events = await listEventsRepo();
  }
  res.json(baseResponse({ success: true, data: events }));
};

export const updateEvent = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { id } = req.params;
  const data = req.body;
  const event = await updateEventRepo(id, data);
  res.json(baseResponse({ success: true, data: event }));
};

export const deleteEvent = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { id } = req.params;
  await deleteEventRepo(id);
  res.json(baseResponse({ success: true }));
};

export const joinEvent = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = token ? verifyJwt(token) as any : null;
  if (!payload) return res.status(401).json(baseResponse({ success: false, error: 'Unauthorized' }));
  const { id } = req.params;
  const { joinCode } = req.body;
  const event = await findEventById(id);
  if (!event || event.joinCode !== joinCode) return res.status(400).json(baseResponse({ success: false, error: 'Invalid event or join code' }));
  await createEventParticipant({ userId: payload.userId, eventId: id });
  res.json(baseResponse({ success: true, data: event }));
};
