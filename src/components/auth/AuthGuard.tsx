"use client";

import { useEffect } from "react";
import { Spin } from "antd";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isError } = useCurrentUser();

  // If auth/me fails for any reason (401, 500, network error), redirect to login.
  useEffect(() => {
    if (isError && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
  }, [isError]);

  if (isLoading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
