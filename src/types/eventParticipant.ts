export interface EventParticipant {
  userId: string;
  eventId: string;
  joinedAt: Date;
  nodeColor?: string;
  attendanceStatus?: string;
}
