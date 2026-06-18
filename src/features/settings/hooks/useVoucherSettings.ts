"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVoucherSettings, updateVoucherSettings } from "../api/voucher-api";
import type { VoucherSettings } from "../types";

export const voucherKeys = { current: ["voucher-settings"] as const };

export function useVoucherSettings() {
  return useQuery({ queryKey: voucherKeys.current, queryFn: getVoucherSettings });
}

export function useUpdateVoucherSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<VoucherSettings>) => updateVoucherSettings(patch),
    onSuccess: (data) => qc.setQueryData(voucherKeys.current, data),
  });
}
