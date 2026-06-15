import { apiClient } from "@/lib/api/client";
import type { CustomerGroup, PriceList } from "../types";

export async function getCustomerGroups(): Promise<CustomerGroup[]> {
  const { data } = await apiClient.get<CustomerGroup[]>("/customer-groups");
  return data;
}

export async function getPriceLists(): Promise<PriceList[]> {
  const { data } = await apiClient.get<PriceList[]>("/price-lists");
  return data;
}

export async function createPriceList(payload: Partial<PriceList>): Promise<PriceList> {
  const { data } = await apiClient.post<PriceList>("/price-lists", payload);
  return data;
}

export async function updatePriceList(
  id: string,
  payload: Partial<PriceList>,
): Promise<PriceList> {
  const { data } = await apiClient.patch<PriceList>(`/price-lists/${id}`, payload);
  return data;
}
