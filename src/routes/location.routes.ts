import { Router } from 'express';
import locationController from '../controllers/location.controller';
import { optionalAuth, authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { body, param, query } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/v1/locations
 * @desc    Update participant location
 * @access  Public
 */
router.post(
  '/',
  validate([
    body('participantId').notEmpty().withMessage('Participant ID is required'),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude required'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude required'),
    body('accuracy').optional().isFloat({ min: 0 }),
  ]),
  locationController.updateLocation
);

/**
 * @route   POST /api/v1/locations/batch
 * @desc    Batch update locations
 * @access  Private (SECURITY_STAFF, SUPER_ADMIN)
 */
router.post(
  '/batch',
  authenticate,
  authorize('SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([body('locations').isArray().withMessage('Locations must be an array')]),
  locationController.batchUpdateLocations
);

/**
 * @route   GET /api/v1/participants/:participantId/location
 * @desc    Get latest location for participant
 * @access  Public
 */
router.get(
  '/participants/:participantId/location',
  validate([param('participantId').notEmpty()]),
  locationController.getLatestLocation
);

/**
 * @route   GET /api/v1/participants/:participantId/location/history
 * @desc    Get location history
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.get(
  '/participants/:participantId/location/history',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([
    param('participantId').notEmpty(),
    query('limit').optional().isInt({ min: 1, max: 1000 }),
  ]),
  locationController.getLocationHistory
);

export default router;