import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { UserRole } from '@prisma/client';
import { AppError } from './errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { prisma } from '../config/database';

interface JwtPayload {
  userId: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Authenticate user via JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!user) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User no longer exists');
    }

    // Attach user info to request
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Authorize user based on roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return next(
        new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
      );
    }

    if (!roles.includes(req.userRole)) {
      return next(
        new AppError(
          HTTP_STATUS.FORBIDDEN,
          `Role ${req.userRole} is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

/**
 * Optional authentication (for public endpoints that can work with/without auth)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      
      req.userId = decoded.userId;
      req.userRole = decoded.role;
    }
    
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};