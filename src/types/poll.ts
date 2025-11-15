export interface Poll {
  id: string;
  eventId: string;
  question: string;
  createdAt: Date;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  votes: number;
}

export interface PollVote {
  pollOptionId: string;
  userId: string;
  votedAt: Date;
  virtualAreaId?: string;
  notificationId?: string;
}
