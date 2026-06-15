import { apiClient } from "@/lib/api/client";
import type { Category } from "../types";

export interface CategoryPayload {
  name: string;
  parentId?: string | null;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories", payload);
  return data;
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryPayload>,
): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<Category> {
  const { data } = await apiClient.delete<Category>(`/categories/${id}`);
  return data;
}
