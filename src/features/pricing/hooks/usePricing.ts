"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPriceList,
  getCustomerGroups,
  getPriceLists,
  updatePriceList,
} from "../api/pricing-api";
import type { PriceList } from "../types";

export const pricingKeys = {
  groups: ["customer-groups"] as const,
  priceLists: ["price-lists"] as const,
};

export function useCustomerGroups() {
  return useQuery({ queryKey: pricingKeys.groups, queryFn: getCustomerGroups });
}

export function usePriceLists() {
  return useQuery({ queryKey: pricingKeys.priceLists, queryFn: getPriceLists });
}

export function useCreatePriceList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PriceList>) => createPriceList(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingKeys.priceLists }),
  });
}

export function useUpdatePriceList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PriceList> }) =>
      updatePriceList(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingKeys.priceLists }),
  });
}
