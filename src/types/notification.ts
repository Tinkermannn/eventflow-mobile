export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  eventId?: string;
  category?: string;
  createdAt: Date;
}
