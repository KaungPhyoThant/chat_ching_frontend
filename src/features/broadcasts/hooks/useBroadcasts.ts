"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBroadcast,
  getBroadcasts,
  sendBroadcast,
  type BroadcastPayload,
} from "../api/broadcasts-api";

export const broadcastKeys = {
  list: ["broadcasts"] as const,
};

export function useBroadcasts() {
  return useQuery({ queryKey: broadcastKeys.list, queryFn: getBroadcasts });
}

export function useCreateBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BroadcastPayload) => createBroadcast(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: broadcastKeys.list }),
  });
}

export function useSendBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendBroadcast(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: broadcastKeys.list }),
  });
}
