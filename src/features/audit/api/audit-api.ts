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

export async function getAuditLogs(): Promise<AuditEntry[]> {
  const { data } = await apiClient.get<AuditEntry[]>("/audit-logs");
  return data;
}
