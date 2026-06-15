"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCapabilities, updateCapabilities } from "../api/capabilities-api";
import type { Capabilities } from "../types";

export const capabilitiesKeys = { current: ["capabilities"] as const };

export function useCapabilitiesQuery() {
  return useQuery({ queryKey: capabilitiesKeys.current, queryFn: getCapabilities });
}

export function useUpdateCapabilities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Capabilities>) => updateCapabilities(patch),
    onSuccess: (data) => qc.setQueryData(capabilitiesKeys.current, data),
  });
}
