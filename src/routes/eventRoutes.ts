import { Router } from 'express';
import { requireAuth } from '../utils/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { createEvent, getEvent, listEvents, updateEvent, deleteEvent, joinEvent } from '../controllers/eventController';

const router = Router();

router.post('/', requireAuth, requireRole(['ORGANIZER']), createEvent);
router.get('/:id', getEvent);
router.get('/', listEvents);
router.patch('/:id', requireAuth, requireRole(['ORGANIZER']), updateEvent);
router.delete('/:id', requireAuth, requireRole(['ORGANIZER']), deleteEvent);
router.post('/:id/join', requireAuth, joinEvent);

export default router;
