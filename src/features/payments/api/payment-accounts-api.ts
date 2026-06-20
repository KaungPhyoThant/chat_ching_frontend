import { apiClient } from "@/lib/api/client";
import type { PaymentAccount } from "../types";

export async function getPaymentAccounts(): Promise<PaymentAccount[]> {
  const { data } = await apiClient.get<PaymentAccount[]>("/payment-accounts");
  return data;
}

export async function createPaymentAccount(
  payload: Partial<PaymentAccount>,
): Promise<PaymentAccount> {
  const { data } = await apiClient.post<PaymentAccount>(
    "/payment-accounts",
    payload,
  );
  return data;
}

export async function updatePaymentAccount(
  id: string,
  payload: Partial<PaymentAccount>,
): Promise<PaymentAccount> {
  const { data } = await apiClient.patch<PaymentAccount>(
    `/payment-accounts/${id}`,
    payload,
  );
  return data;
}

export async function deletePaymentAccount(id: string): Promise<void> {
  await apiClient.delete(`/payment-accounts/${id}`);
}
