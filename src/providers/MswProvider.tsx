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

    // Race the worker start against a 1-second timeout
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        logger.warn("MSW worker start timed out after 1000ms. Fallbacking to proxy API.");
        resolve();
      }, 1000);
    });

    void Promise.race([startWorkerOnce(), timeoutPromise])
      .then(() => {
        if (active) setReady(true);
      })
      .catch((error) => {
        logger.error("Failed to start MSW worker:", error);
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
