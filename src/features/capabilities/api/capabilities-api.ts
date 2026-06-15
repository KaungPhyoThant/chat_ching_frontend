import { apiClient } from "@/lib/api/client";
import type { Capabilities } from "../types";

export async function getCapabilities(): Promise<Capabilities> {
  const { data } = await apiClient.get<Capabilities>("/settings/capabilities");
  return data;
}

export async function updateCapabilities(
  patch: Partial<Capabilities>,
): Promise<Capabilities> {
  const { data } = await apiClient.patch<Capabilities>(
    "/settings/capabilities",
    patch,
  );
  return data;
}
