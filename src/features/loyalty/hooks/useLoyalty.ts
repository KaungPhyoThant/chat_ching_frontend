"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adjustCustomerPoints, getCustomerLoyalty } from "../api/loyalty-api";

export function useCustomerLoyalty(customerId: string | null) {
  return useQuery({
    queryKey: ["loyalty", customerId],
    queryFn: () => getCustomerLoyalty(customerId as string),
    enabled: !!customerId,
  });
}

export function useAdjustPoints(customerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ points, note }: { points: number; note?: string }) =>
      adjustCustomerPoints(customerId as string, points, note),
    onSuccess: (data) => {
      qc.setQueryData(["loyalty", customerId], data);
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
