import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/helpers';
import { HTTP_STATUS } from '../utils/constants';

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name, phone, role } = req.body;

    const result = await authService.register({
      email,
      password,
      name,
      phone,
      role,
    });

    sendSuccess(
      res,
      result,
      'Registration successful',
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    sendSuccess(res, result, 'Login successful');
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    sendSuccess(res, result, 'Token refreshed successfully');
  });

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    const user = await authService.getCurrentUser(userId);

    sendSuccess(res, user);
  });

  /**
   * Change password
   * PUT /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { oldPassword, newPassword } = req.body;

    await authService.changePassword(userId, oldPassword, newPassword);

    sendSuccess(res, null, 'Password changed successfully');
  });

  /**
   * Update profile
   * PUT /api/v1/auth/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { name, phone } = req.body;

    const user = await authService.updateProfile(userId, { name, phone });

    sendSuccess(res, user, 'Profile updated successfully');
  });

  /**
   * Logout (client-side token removal, optional endpoint)
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // In JWT, logout is typically handled client-side by removing tokens
    // This endpoint is optional and can be used for additional logic (e.g., blacklisting tokens)
    
    sendSuccess(res, null, 'Logged out successfully');
  });
}

export default new AuthController();