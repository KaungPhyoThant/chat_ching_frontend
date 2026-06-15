import { apiClient } from "@/lib/api/client";
import type { Promotion, PromotionType } from "../types";

export interface PromotionPayload {
  code: string;
  type: PromotionType;
  value: number;
  minSpend?: number;
  maxUses?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export async function getPromotions(): Promise<Promotion[]> {
  const { data } = await apiClient.get<Promotion[]>("/promotions");
  return data;
}

export async function createPromotion(payload: PromotionPayload): Promise<Promotion> {
  const { data } = await apiClient.post<Promotion>("/promotions", payload);
  return data;
}

export async function updatePromotion(
  id: string,
  payload: Partial<PromotionPayload>,
): Promise<Promotion> {
  const { data } = await apiClient.patch<Promotion>(`/promotions/${id}`, payload);
  return data;
}

export async function deletePromotion(id: string): Promise<Promotion> {
  const { data } = await apiClient.delete<Promotion>(`/promotions/${id}`);
  return data;
}
