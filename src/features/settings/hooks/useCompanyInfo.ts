"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCompanyInfo, updateCompanyInfo } from "../api/company-api";
import type { CompanyInfo } from "../types";

export const companyKeys = { current: ["company-info"] as const };

export function useCompanyInfo() {
  return useQuery({ queryKey: companyKeys.current, queryFn: getCompanyInfo });
}

export function useUpdateCompanyInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<CompanyInfo>) => updateCompanyInfo(patch),
    onSuccess: (data) => qc.setQueryData(companyKeys.current, data),
  });
}
