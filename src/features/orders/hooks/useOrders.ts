"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus } from "../api/orders-api";
import type { OrderStatus } from "../types";

export const orderKeys = {
  list: ["orders"] as const,
};

export function useOrders() {
  return useQuery({ queryKey: orderKeys.list, queryFn: getOrders });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      cancelReason,
    }: {
      id: string;
      status: OrderStatus;
      cancelReason?: string;
    }) => updateOrderStatus(id, status, cancelReason),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.list }),
  });
}
