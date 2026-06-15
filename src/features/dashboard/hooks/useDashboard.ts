"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboard-api";

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: getDashboardStats });
}
