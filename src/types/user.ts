export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: 'PARTICIPANT' | 'ORGANIZER';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}
