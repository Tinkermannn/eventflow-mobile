export interface Event {
  id: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  locationName: string;
  latitude: number;
  longitude: number;
  status: string;
  joinCode: string;
  organizerId: string;
  totalParticipants: number;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}
