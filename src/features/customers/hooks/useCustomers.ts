"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCustomer,
  getCustomers,
  updateCustomer,
} from "../api/customers-api";
import type { Customer } from "../types";

export const customerKeys = {
  list: ["customers"] as const,
  detail: (id: string) => ["customers", id] as const,
};

export function useCustomers() {
  return useQuery({ queryKey: customerKeys.list, queryFn: getCustomers });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ""),
    queryFn: () => getCustomer(id as string),
    enabled: !!id,
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Customer> }) =>
      updateCustomer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.list }),
  });
}
