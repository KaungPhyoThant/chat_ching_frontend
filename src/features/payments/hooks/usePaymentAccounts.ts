"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentAccount,
  deletePaymentAccount,
  getPaymentAccounts,
  updatePaymentAccount,
} from "../api/payment-accounts-api";
import type { PaymentAccount } from "../types";

const key = ["payment-accounts"] as const;

export function usePaymentAccounts() {
  return useQuery({ queryKey: key, queryFn: getPaymentAccounts });
}

export function useCreatePaymentAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PaymentAccount>) =>
      createPaymentAccount(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdatePaymentAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<PaymentAccount>;
    }) => updatePaymentAccount(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeletePaymentAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
