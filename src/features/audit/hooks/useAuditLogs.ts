"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuditLogs, type AuditQuery } from "../api/audit-api";

export const auditQueryKeys = {
  all: ["audit-logs"] as const,
  list: (params: AuditQuery) => ["audit-logs", params] as const,
};

export function useAuditLogs(params: AuditQuery = {}) {
  return useQuery({
    queryKey: auditQueryKeys.list(params),
    queryFn: () => getAuditLogs(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000, // Audit logs refresh every 15 seconds or on page reload
  });
}
