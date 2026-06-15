"use client";

import { useEffect } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

/** Validates the httpOnly session via `GET /api/auth/me` and syncs the user into the store. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useCurrentUser();

  useEffect(() => {
    localStorage.removeItem("app-auth");
  }, []);

  return <>{children}</>;
}
