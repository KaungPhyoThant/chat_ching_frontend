export type BroadcastStatus = "DRAFT" | "SCHEDULED" | "SENT";

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  segment: string;
  status: BroadcastStatus;
  recipientCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}
