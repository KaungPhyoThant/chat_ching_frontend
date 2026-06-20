import { apiClient } from "@/lib/api/client";
import type { LoyaltySettings } from "../types";

export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const { data } = await apiClient.get<LoyaltySettings>("/settings/loyalty");
  return data;
}

export async function updateLoyaltySettings(
  patch: Partial<LoyaltySettings>,
): Promise<LoyaltySettings> {
  const { data } = await apiClient.patch<LoyaltySettings>(
    "/settings/loyalty",
    patch,
  );
  return data;
}
