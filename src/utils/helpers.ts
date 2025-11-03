import { Response } from 'express';
import { ApiResponse } from '../types/interfaces';
import { HTTP_STATUS } from './constants';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: Array<{ field?: string; message: string }>
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
};

export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const sanitizeUser = <T extends Record<string, any>>(
  user: T
): Omit<T, 'password'> => {
  const { password, ...sanitized } = user;
  return sanitized;
};