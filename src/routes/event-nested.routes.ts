import { Router } from 'express';
import participantController from '../controllers/participant.controller';
import locationController from '../controllers/location.controller';
import zoneController from '../controllers/zone.controller';
import reportController from '../controllers/report.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { param, query } from 'express-validator';

const router = Router();

/**
 * Event Participants Routes
 */

/**
 * @route   GET /api/v1/events/:eventId/participants
 * @desc    Get all participants for event
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.get(
  '/:eventId/participants',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([param('eventId').notEmpty()]),
  participantController.getEventParticipants
);

/**
 * @route   GET /api/v1/events/:eventId/participants/count
 * @desc    Get active participants count
 * @access  Public
 */
router.get(
  '/:eventId/participants/count',
  validate([param('eventId').notEmpty()]),
  participantController.getActiveCount
);

/**
 * Event Locations Routes
 */

/**
 * @route   GET /api/v1/events/:eventId/locations
 * @desc    Get all latest locations for event
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.get(
  '/:eventId/locations',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([param('eventId').notEmpty()]),
  locationController.getEventLocations
);

/**
 * Event Zones Routes
 */

/**
 * @route   GET /api/v1/events/:eventId/zones
 * @desc    Get all zones for event
 * @access  Public
 */
router.get(
  '/:eventId/zones',
  validate([param('eventId').notEmpty()]),
  zoneController.getEventZones
);

/**
 * @route   GET /api/v1/events/:eventId/zones/critical
 * @desc    Get critical zones (HIGH or CRITICAL risk)
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.get(
  '/:eventId/zones/critical',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([param('eventId').notEmpty()]),
  zoneController.getCriticalZones
);

/**
 * Event Reports Routes
 */

/**
 * @route   GET /api/v1/events/:eventId/reports
 * @desc    Get all reports for event
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.get(
  '/:eventId/reports',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([param('eventId').notEmpty()]),
  reportController.getEventReports
);

/**
 * @route   GET /api/v1/events/:eventId/reports/emergency
 * @desc    Get emergency reports
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.get(
  '/:eventId/reports/emergency',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([param('eventId').notEmpty()]),
  reportController.getEmergencyReports
);

/**
 * Zone Density Route
 */

/**
 * @route   GET /api/v1/zones/:zoneId/density
 * @desc    Get zone density (participant count)
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.get(
  '/zones/:zoneId/density',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([
    param('zoneId').notEmpty(),
    query('minutesAgo').optional().isInt({ min: 1, max: 60 }),
  ]),
  locationController.getZoneDensity
);

export default router;