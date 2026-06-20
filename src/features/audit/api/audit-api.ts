import { apiClient } from "@/lib/api/client";

export interface AuditEntry {
  id: string;
  time: string;
  user: string;
  action: string;
  module: string;
  resource: string;
  ip: string;
}

export interface AuditQuery {
  search?: string;
  module?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditListResponse {
  items: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  modules: string[];
  actions: string[];
}

export async function getAuditLogs(
  params: AuditQuery = {},
): Promise<AuditListResponse> {
  const { data } = await apiClient.get<AuditListResponse>("/audit-logs", {
    params,
  });
  return data;
}
