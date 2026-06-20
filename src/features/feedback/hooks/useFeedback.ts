"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { FeedbackData } from "../types";

async function getFeedback(): Promise<FeedbackData> {
  const { data } = await apiClient.get<FeedbackData>("/feedback");
  return data;
}

export function useFeedback() {
  return useQuery({ queryKey: ["feedback"], queryFn: getFeedback });
}
