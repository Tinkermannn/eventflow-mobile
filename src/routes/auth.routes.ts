import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} from '../validators/auth.validator';
import { body } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validate(registerValidator), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginValidator), authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshTokenValidator),
  authController.refreshToken
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/change-password',
  authenticate,
  validate([
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ]),
  authController.changePassword
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validate([
    body('name').optional().trim().isLength({ min: 2 }),
    body('phone').optional().isMobilePhone('any'),
  ]),
  authController.updateProfile
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

export default router;