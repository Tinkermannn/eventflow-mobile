import { Router } from 'express';
import zoneController from '../controllers/zone.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { body, param } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/v1/zones
 * @desc    Create new zone
 * @access  Private (EVENT_ORGANIZER, SUPER_ADMIN)
 */
router.post(
  '/',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  validate([
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
    body('polygon').notEmpty().withMessage('Polygon is required'),
    body('capacity').optional().isInt({ min: 1 }),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  ]),
  zoneController.createZone
);

/**
 * @route   GET /api/v1/zones/:id
 * @desc    Get zone by ID
 * @access  Public
 */
router.get('/:id', validate([param('id').notEmpty()]), zoneController.getZone);

/**
 * @route   PUT /api/v1/zones/:id
 * @desc    Update zone
 * @access  Private (EVENT_ORGANIZER owner, SUPER_ADMIN)
 */
router.put(
  '/:id',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  validate([
    param('id').notEmpty(),
    body('name').optional().trim().isLength({ min: 2 }),
    body('polygon').optional().notEmpty(),
    body('riskLevel')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('capacity').optional().isInt({ min: 1 }),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  ]),
  zoneController.updateZone
);

/**
 * @route   DELETE /api/v1/zones/:id
 * @desc    Delete zone
 * @access  Private (EVENT_ORGANIZER owner, SUPER_ADMIN)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'),
  validate([param('id').notEmpty()]),
  zoneController.deleteZone
);

/**
 * @route   PATCH /api/v1/zones/:id/risk-level
 * @desc    Update zone risk level
 * @access  Private (EVENT_ORGANIZER, SECURITY_STAFF, SUPER_ADMIN)
 */
router.patch(
  '/:id/risk-level',
  authenticate,
  authorize('EVENT_ORGANIZER', 'SECURITY_STAFF', 'SUPER_ADMIN'),
  validate([
    param('id').notEmpty(),
    body('riskLevel')
      .notEmpty()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .withMessage('Valid risk level required'),
  ]),
  zoneController.updateRiskLevel
);

export default router;