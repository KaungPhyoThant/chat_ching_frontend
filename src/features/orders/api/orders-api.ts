import { apiClient } from "@/lib/api/client";
import type { Order, OrderStatus } from "../types";

export async function getOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>("/orders");
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  cancelReason?: string,
): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, {
    status,
    cancelReason,
  });
  return data;
}
