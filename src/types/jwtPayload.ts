export interface JWTPayload {
  userId: string;
  email?: string;
  role?: 'PARTICIPANT' | 'ORGANIZER';
  // Tambahkan field lain jika diperlukan
}
