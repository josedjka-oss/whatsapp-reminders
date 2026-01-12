export type MessageType = "unique" | "daily" | "biweekly" | "monthly";

export type MessageStatus = "pending" | "sent" | "error";

export interface ScheduledMessage {
  id: string;
  phoneNumber: string;
  message: string;
  scheduledDate: Date;
  type: MessageType;
  status: MessageStatus;
  createdAt: Date;
  sentAt?: Date;
  errorMessage?: string;
}

export interface MessageFormData {
  phoneNumber: string;
  message: string;
  scheduledDate: string;
  scheduledTime: string;
  type: MessageType;
}
