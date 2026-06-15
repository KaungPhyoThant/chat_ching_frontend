"use client";

import { useEffect, useState } from "react";
import { ENV } from "@/config/env";
import { logger } from "@/lib/observability/logger";

// Module-level singleton: worker.start() must run exactly once, even across
// React Strict Mode's double-invoked effects and component remounts.
let startPromise: Promise<unknown> | null = null;

function startWorkerOnce(): Promise<unknown> {
  if (!startPromise) {
    startPromise = import("@/mocks/browser").then(({ worker }) =>
      worker.start({ onUnhandledRequest: "bypass" }).then((result) => {
        logger.info("MSW mock worker started");
        return result;
      }),
    );
  }
  return startPromise;
}

/**
 * Starts the MSW worker in development before rendering children that fetch.
 * In production it is a no-op (children render immediately).
 */
export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!ENV.mswEnabled);

  useEffect(() => {
    if (!ENV.mswEnabled) return;
    let active = true;
    void startWorkerOnce().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
