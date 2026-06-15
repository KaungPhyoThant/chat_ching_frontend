import { apiClient } from "@/lib/api/client";
import type { Broadcast } from "../types";

export interface BroadcastPayload {
  title: string;
  body: string;
  segment: string;
  imageUrl?: string;
  scheduledAt?: string;
}

export async function getBroadcasts(): Promise<Broadcast[]> {
  const { data } = await apiClient.get<Broadcast[]>("/broadcasts");
  return data;
}

export async function createBroadcast(payload: BroadcastPayload): Promise<Broadcast> {
  const { data } = await apiClient.post<Broadcast>("/broadcasts", payload);
  return data;
}

export async function sendBroadcast(id: string): Promise<Broadcast> {
  const { data } = await apiClient.post<Broadcast>(`/broadcasts/${id}/send`);
  return data;
}
