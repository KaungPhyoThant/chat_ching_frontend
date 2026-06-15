"use client";

import { createContext, useContext, type ReactNode } from "react";
import { FEATURE_DEFAULTS } from "@/config/feature-defaults";
import type { Capabilities } from "@/features/capabilities/types";
import { useCapabilitiesQuery } from "@/features/capabilities/hooks/useCapabilities";

const CapabilitiesContext = createContext<Capabilities>(FEATURE_DEFAULTS);

export function CapabilitiesProvider({ children }: { children: ReactNode }) {
  const { data } = useCapabilitiesQuery();
  return (
    <CapabilitiesContext.Provider value={data ?? FEATURE_DEFAULTS}>
      {children}
    </CapabilitiesContext.Provider>
  );
}

export function useCapabilities(): Capabilities {
  return useContext(CapabilitiesContext);
}
