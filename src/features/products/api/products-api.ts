import { apiClient } from "@/lib/api/client";
import type { Product } from "../types";

/** Create/update payload — a partial product (variants/options/attributes optional). */
export type ProductPayload = Partial<Product>;

export async function getProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/products");
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products", payload);
  return data;
}

export async function updateProduct(
  id: string,
  payload: ProductPayload,
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function adjustProductStock(
  id: string,
  stock: number,
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, { stock });
  return data;
}

export async function deleteProduct(id: string): Promise<Product> {
  const { data } = await apiClient.delete<Product>(`/products/${id}`);
  return data;
}
