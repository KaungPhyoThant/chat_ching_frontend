"use client";

import type { ReactNode } from "react";
import { useCapabilities } from "@/providers/CapabilitiesProvider";
import type { FeatureKey } from "@/features/capabilities/types";

export function useFeature(key: FeatureKey): boolean {
  return useCapabilities()[key];
}

export function Feature({ flag, children }: { flag: FeatureKey; children: ReactNode }) {
  return useFeature(flag) ? <>{children}</> : null;
}
