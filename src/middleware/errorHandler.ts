import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';
import { sendError } from '../utils/helpers';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Default error
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.INTERNAL_ERROR;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    
    switch (err.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = HTTP_STATUS.NOT_FOUND;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        break;
      default:
        message = 'Database operation failed';
    }
  }

  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid data provided';
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Send error response
  sendError(res, message, statusCode);
};

/**
 * Not found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.originalUrl} not found`
  );
  next(error);
};

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};