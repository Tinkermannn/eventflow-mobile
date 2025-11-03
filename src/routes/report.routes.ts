import { Router } from 'express';
import reportController from '../controllers/report.controller';
import { optionalAuth, authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { body, param } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/v1/reports
 * @desc    Create new report
 * @access  Public (optional auth)
 */
router.post(
  '/',
  optionalAuth,
  validate([
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('message')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Message must be at least 10 characters'),
    body('participantId').optional(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
  ]),
  reportController.createReport
);

/**
 * @route   GET /api/v1/reports/:id
 * @desc    Get report by ID
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.get(
  '/:id',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([param('id').notEmpty()]),
  reportController.getReport
);

/**
 * @route   PATCH /api/v1/reports/:id/status
 * @desc    Update report status
 * @access  Private (SECURITY_STAFF, SUPER_ADMIN)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([
    param('id').notEmpty(),
    body('status')
      .notEmpty()
      .isIn(['PENDING', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'])
      .withMessage('Valid status required'),
  ]),
  reportController.updateStatus
);

/**
 * @route   PATCH /api/v1/reports/:id/priority
 * @desc    Update report priority
 * @access  Private (SECURITY_STAFF, SUPER_ADMIN)
 */
router.patch(
  '/:id/priority',
  authenticate,
  authorize('SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([
    param('id').notEmpty(),
    body('priority')
      .notEmpty()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'])
      .withMessage('Valid priority required'),
  ]),
  reportController.updatePriority
);

export default router;