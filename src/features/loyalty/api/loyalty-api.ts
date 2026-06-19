import { apiClient } from "@/lib/api/client";
import type { LoyaltyHistory } from "../types";

export async function getCustomerLoyalty(
  customerId: string,
): Promise<LoyaltyHistory> {
  const { data } = await apiClient.get<LoyaltyHistory>(
    `/loyalty/customers/${customerId}`,
  );
  return data;
}

export async function adjustCustomerPoints(
  customerId: string,
  points: number,
  note?: string,
): Promise<LoyaltyHistory> {
  const { data } = await apiClient.post<LoyaltyHistory>(
    `/loyalty/customers/${customerId}/adjust`,
    { points, note },
  );
  return data;
}
