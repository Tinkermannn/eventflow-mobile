import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import userRepository from '../repositories/user.repository';
import { config } from '../config/environment';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { sanitizeUser } from '../utils/helpers';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    const { email, password, name, phone, role = 'PARTICIPANT' } = data;

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role,
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
        userId: string;
      };

      // Check if user exists
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not found');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user.id, user.role);

      return { accessToken };
    } catch (error) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return sanitizeUser(user);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid old password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await userRepository.update(userId, {
      password: hashedPassword,
    });
  }

  /**
   * Update profile
   */
  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await userRepository.update(userId, data);
    return sanitizeUser(user);
  }

  /**
   * Generate access token
   */
  private generateAccessToken(userId: string, role: UserRole): string {
    return jwt.sign(
      { userId, role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );
  }
}

export default new AuthService();