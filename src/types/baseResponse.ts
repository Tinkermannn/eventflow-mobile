
export interface BaseResponse<T = unknown> {
  /** Status response (true jika berhasil, false jika error) */
  success: boolean;
  /** Pesan tambahan */
  message?: string;
  /** Data hasil response */
  data?: T;
  /** Pesan error jika gagal */
  error?: string;
}
