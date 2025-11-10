export interface BaseResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

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
