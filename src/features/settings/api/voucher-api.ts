import { apiClient } from "@/lib/api/client";
import type { VoucherSettings } from "../types";

export async function getVoucherSettings(): Promise<VoucherSettings> {
  const { data } = await apiClient.get<VoucherSettings>("/settings/voucher");
  return data;
}

export async function updateVoucherSettings(
  patch: Partial<VoucherSettings>,
): Promise<VoucherSettings> {
  const { data } = await apiClient.patch<VoucherSettings>(
    "/settings/voucher",
    patch,
  );
  return data;
}
