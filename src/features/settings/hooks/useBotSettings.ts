"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBotSettings, updateBotSettings } from "../api/bot-api";
import type { BotSettings } from "../types";

export const botKeys = { current: ["bot-settings"] as const };

export function useBotSettings() {
  return useQuery({ queryKey: botKeys.current, queryFn: getBotSettings });
}

export function useUpdateBotSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<BotSettings>) => updateBotSettings(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: botKeys.current }),
  });
}
