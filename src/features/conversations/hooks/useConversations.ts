"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  replyToConversation,
  setHandoff,
} from "../api/conversations-api";

export const conversationKeys = {
  list: ["conversations"] as const,
};

export function useConversations() {
  return useQuery({ queryKey: conversationKeys.list, queryFn: getConversations });
}

export function useSetHandoff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, needsHandoff }: { id: string; needsHandoff: boolean }) =>
      setHandoff(id, needsHandoff),
    onSuccess: () => qc.invalidateQueries({ queryKey: conversationKeys.list }),
  });
}

export function useReplyConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      replyToConversation(id, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: conversationKeys.list }),
  });
}
