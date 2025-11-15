export interface Report {
  id: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  reporterId: string;
  eventId: string;
  createdAt: Date;
  mediaUrls?: string[];
}
