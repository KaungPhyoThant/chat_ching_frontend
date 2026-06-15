"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPromotion,
  deletePromotion,
  getPromotions,
  updatePromotion,
  type PromotionPayload,
} from "../api/promotions-api";

export const promotionKeys = {
  list: ["promotions"] as const,
};

export function usePromotions() {
  return useQuery({ queryKey: promotionKeys.list, queryFn: getPromotions });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PromotionPayload) => createPromotion(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: promotionKeys.list }),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PromotionPayload> }) =>
      updatePromotion(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: promotionKeys.list }),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePromotion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: promotionKeys.list }),
  });
}
