import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createEventValidator,
  updateEventValidator,
  getEventValidator,
  listEventsValidator,
} from '../validators/event.validator';

const router = Router();

/**
 * @route   GET /api/v1/events
 * @desc    List all events (with pagination)
 * @access  Public
 */
router.get('/', validate(listEventsValidator), eventController.listEvents);

/**
 * @route   GET /api/v1/events/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
router.get('/upcoming', eventController.getUpcomingEvents);

/**
 * @route   GET /api/v1/events/ongoing
 * @desc    Get ongoing events
 * @access  Public
 */
router.get('/ongoing', eventController.getOngoingEvents);

/**
 * @route   GET /api/v1/events/my-events
 * @desc    Get my organized events
 * @access  Private (EVENT_ORGANIZER, SUPER_ADMIN)
 */
router.get(
  '/my-events',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  eventController.getMyEvents
);

/**
 * @route   POST /api/v1/events
 * @desc    Create new event
 * @access  Private (EVENT_ORGANIZER, SUPER_ADMIN)
 */
router.post(
  '/',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  validate(createEventValidator),
  eventController.createEvent
);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', validate(getEventValidator), eventController.getEvent);

/**
 * @route   PUT /api/v1/events/:id
 * @desc    Update event
 * @access  Private (EVENT_ORGANIZER owner or SUPER_ADMIN)
 */
router.put(
  '/:id',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  validate(updateEventValidator),
  eventController.updateEvent
);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete event
 * @access  Private (EVENT_ORGANIZER owner or SUPER_ADMIN)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  validate(getEventValidator),
  eventController.deleteEvent
);

/**
 * @route   POST /api/v1/events/:id/publish
 * @desc    Publish event
 * @access  Private (EVENT_ORGANIZER owner or SUPER_ADMIN)
 */
router.post(
  '/:id/publish',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  eventController.publishEvent
);

/**
 * @route   POST /api/v1/events/:id/start
 * @desc    Start event
 * @access  Private (EVENT_ORGANIZER owner or SUPER_ADMIN)
 */
router.post(
  '/:id/start',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  eventController.startEvent
);

/**
 * @route   POST /api/v1/events/:id/complete
 * @desc    Complete event
 * @access  Private (EVENT_ORGANIZER owner or SUPER_ADMIN)
 */
router.post(
  '/:id/complete',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  eventController.completeEvent
);

export default router;