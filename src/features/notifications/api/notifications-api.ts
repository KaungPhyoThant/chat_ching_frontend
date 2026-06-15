import { apiClient } from "@/lib/api/client";
import type { AppNotification } from "../data";

export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await apiClient.get<AppNotification[]>("/notifications");
  return data;
}

export async function markAsRead(id: string): Promise<AppNotification> {
  const { data } = await apiClient.patch<AppNotification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllAsRead(): Promise<{ count: number }> {
  const { data } = await apiClient.post<{ count: number }>("/notifications/mark-all-read");
  return data;
}
