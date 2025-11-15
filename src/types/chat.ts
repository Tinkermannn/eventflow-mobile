import { User } from './user';

export interface ChatMessage {
  id: string;
  eventId: string;
  user: User;
  message: string;
  createdAt: Date;
  virtualAreaId?: string;
}
