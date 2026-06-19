import { apiClient } from "@/lib/api/client";
import type { ReportData, ReportRange } from "../types";

export async function getReports(range: ReportRange): Promise<ReportData> {
  const { data } = await apiClient.get<ReportData>("/dashboard/reports", {
    params: { range },
  });
  return data;
}
