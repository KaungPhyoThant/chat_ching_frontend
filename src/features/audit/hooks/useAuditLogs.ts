"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/audit-api";

export const auditQueryKeys = {
  list: ["audit-logs"] as const,
};

export function useAuditLogs() {
  return useQuery({
    queryKey: auditQueryKeys.list,
    queryFn: getAuditLogs,
    staleTime: 15_000, // Audit logs refresh every 15 seconds or on page reload
  });
}
