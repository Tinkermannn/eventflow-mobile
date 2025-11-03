import { Router } from 'express';
import participantController from '../controllers/participant.controller';
import { optionalAuth, authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { body, param } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/v1/participants/join
 * @desc    Join event as participant
 * @access  Public (optional auth)
 */
router.post(
  '/join',
  optionalAuth,
  validate([
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('name').optional().trim().isLength({ min: 2 }),
    body('phone').optional().isMobilePhone('any'),
  ]),
  participantController.joinEvent
);

/**
 * @route   POST /api/v1/participants/:id/leave
 * @desc    Leave event
 * @access  Public
 */
router.post(
  '/:id/leave',
  validate([param('id').notEmpty()]),
  participantController.leaveEvent
);

/**
 * @route   GET /api/v1/participants/:id
 * @desc    Get participant by ID
 * @access  Public
 */
router.get(
  '/:id',
  validate([param('id').notEmpty()]),
  participantController.getParticipant
);

/**
 * @route   GET /api/v1/participants/device/:deviceId
 * @desc    Get participant by device ID
 * @access  Public
 */
router.get(
  '/device/:deviceId',
  validate([param('deviceId').notEmpty()]),
  participantController.getParticipantByDevice
);

/**
 * @route   POST /api/v1/participants/:id/heartbeat
 * @desc    Update last seen (heartbeat)
 * @access  Public
 */
router.post(
  '/:id/heartbeat',
  validate([param('id').notEmpty()]),
  participantController.updateLastSeen
);

export default router;