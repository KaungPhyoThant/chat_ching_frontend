"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CategoryPayload,
} from "../api/categories-api";

export const categoryKeys = {
  list: ["categories"] as const,
};

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.list, queryFn: getCategories });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.list }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryPayload> }) =>
      updateCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.list }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.list }),
  });
}
