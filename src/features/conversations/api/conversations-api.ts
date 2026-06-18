import { apiClient } from "@/lib/api/client";
import type { Conversation } from "../types";

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<Conversation[]>("/conversations");
  return data;
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await apiClient.get<Conversation>(`/conversations/${id}`);
  return data;
}

export async function setHandoff(
  id: string,
  needsHandoff: boolean,
): Promise<Conversation> {
  const { data } = await apiClient.patch<Conversation>(
    `/conversations/${id}/handoff`,
    { needsHandoff },
  );
  return data;
}

export async function replyToConversation(
  id: string,
  text: string,
): Promise<Conversation> {
  const { data } = await apiClient.post<Conversation>(
    `/conversations/${id}/reply`,
    { text },
  );
  return data;
}
