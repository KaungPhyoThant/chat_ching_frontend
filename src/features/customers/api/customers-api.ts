import { apiClient } from "@/lib/api/client";
import type { Order } from "@/features/orders/types";
import type { Conversation } from "@/features/conversations/types";
import type { Customer } from "../types";

export interface CustomerDetail extends Customer {
  orders: Order[];
  conversations: Conversation[];
}

export async function getCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>("/customers");
  return data;
}

export async function getCustomer(id: string): Promise<CustomerDetail> {
  const { data } = await apiClient.get<CustomerDetail>(`/customers/${id}`);
  return data;
}

export async function updateCustomer(
  id: string,
  payload: Partial<Customer>,
): Promise<Customer> {
  const { data } = await apiClient.patch<Customer>(`/customers/${id}`, payload);
  return data;
}
