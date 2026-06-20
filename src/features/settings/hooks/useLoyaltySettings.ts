"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLoyaltySettings, updateLoyaltySettings } from "../api/loyalty-api";
import type { LoyaltySettings } from "../types";

export const loyaltyKeys = { current: ["loyalty-settings"] as const };

export function useLoyaltySettings() {
  return useQuery({ queryKey: loyaltyKeys.current, queryFn: getLoyaltySettings });
}

export function useUpdateLoyaltySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<LoyaltySettings>) => updateLoyaltySettings(patch),
    onSuccess: (data) => qc.setQueryData(loyaltyKeys.current, data),
  });
}
