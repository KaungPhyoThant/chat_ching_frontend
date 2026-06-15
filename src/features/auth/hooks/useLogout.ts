"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { clearAuthSession } from "@/lib/auth/clear-session";
import { authQueryKeys } from "./useCurrentUser";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    await clearAuthSession();
    queryClient.removeQueries({ queryKey: authQueryKeys.me });
    router.push(ROUTES.login);
  };
}
