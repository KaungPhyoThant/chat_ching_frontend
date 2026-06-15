export type ConversationMessageRole = "customer" | "bot" | "agent";

export interface ConversationMessage {
  id: string;
  role: ConversationMessageRole;
  text: string;
  at: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  intent?: string;
  botState?: string;
  needsHandoff: boolean;
  lastMessageAt: string;
  messages: ConversationMessage[];
}
