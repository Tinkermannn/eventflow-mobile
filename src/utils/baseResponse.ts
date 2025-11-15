/**
 * File: baseResponse.ts
 * Author: eventFlow Team
 * Deskripsi: Utility untuk membentuk response API standar (success, error, data) agar konsisten di seluruh aplikasi.
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-10
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: -
 */
import { BaseResponse } from '../types/baseResponse';

export function baseResponse<T>(params: {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}): BaseResponse<T> {
  return {
    success: params.success,
    message: params.message,
    data: params.data,
    error: params.error
  };
}

export function errorResponse(error: unknown): BaseResponse<never> {
  let errorMsg = 'Internal server error';
  if (typeof error === 'object' && error && 'error' in error) {
    errorMsg = (error as { error: string }).error;
  }
  return baseResponse({ success: false, error: errorMsg });
}
