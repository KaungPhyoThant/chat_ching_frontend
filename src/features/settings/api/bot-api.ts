import { apiClient } from "@/lib/api/client";
import type {
  BotSettings,
  BotSettingsResponse,
  BotStatus,
} from "../types";

export async function getBotSettings(): Promise<BotSettingsResponse> {
  const { data } = await apiClient.get<BotSettingsResponse>("/bot/settings");
  return data;
}

export async function updateBotSettings(
  patch: Partial<BotSettings>,
): Promise<BotStatus> {
  const { data } = await apiClient.patch<BotStatus>("/bot/settings", patch);
  return data;
}
