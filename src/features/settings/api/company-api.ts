import { apiClient } from "@/lib/api/client";
import type { CompanyInfo } from "../types";

export async function getCompanyInfo(): Promise<CompanyInfo> {
  const { data } = await apiClient.get<CompanyInfo>("/settings/company");
  return data;
}

export async function updateCompanyInfo(
  patch: Partial<CompanyInfo>,
): Promise<CompanyInfo> {
  const { data } = await apiClient.patch<CompanyInfo>("/settings/company", patch);
  return data;
}
