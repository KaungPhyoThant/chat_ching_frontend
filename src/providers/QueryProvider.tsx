"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { logger } from "@/lib/observability/logger";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            const status = (error as { status?: number })?.status;
            if (status === 401 || status === 403 || status === 404) {
              logger.warn(`Query failed (${status})`, {
                error,
                queryKey: query.queryKey,
              });
              return;
            }
            logger.error("Query failed", {
              error,
              queryKey: query.queryKey,
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            const status = (error as { status?: number })?.status;
            if (status === 401 || status === 403 || status === 404) {
              logger.warn(`Mutation failed (${status})`, { error });
              return;
            }
            logger.error("Mutation failed", { error });
          },
        }),
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
