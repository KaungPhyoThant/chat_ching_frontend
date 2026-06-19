"use client";

import { useQuery } from "@tanstack/react-query";
import { getReports } from "../api/reports-api";
import type { ReportRange } from "../types";

export function useReports(range: ReportRange) {
  return useQuery({
    queryKey: ["reports", range],
    queryFn: () => getReports(range),
  });
}
