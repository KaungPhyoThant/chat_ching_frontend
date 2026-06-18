"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustProductStock,
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type ProductPayload,
} from "../api/products-api";

export const productKeys = {
  list: ["products"] as const,
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.list, queryFn: getProducts });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.list }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
      updateProduct(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.list }),
  });
}

export function useAdjustProductStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      adjustProductStock(id, stock),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.list }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.list }),
  });
}
