import { apiClient } from "@/lib/api/client";
import type { Product } from "../types";

export interface ProductPayload {
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  description?: string;
  isActive?: boolean;
}

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
  payload: Partial<ProductPayload>,
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<Product> {
  const { data } = await apiClient.delete<Product>(`/products/${id}`);
  return data;
}
