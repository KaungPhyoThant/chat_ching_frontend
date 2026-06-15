"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/auth-api";
import { toCurrentUser } from "../mappers";
import { useAuthStore } from "@/store/auth-store";

export const authQueryKeys = {
  me: ["auth", "me"] as const,
};

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const storedUser = useAuthStore((s) => s.user);

  const query = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: async () => {
      const { user } = await getMe();
      const current = toCurrentUser(user);
      setUser(current);
      return current;
    },
    retry: false,
    staleTime: 60_000,
  });

  return {
    user: query.data ?? storedUser,
    isLoading: query.isLoading,
    isAuthenticated: query.isSuccess,
    isError: query.isError,
    refetch: query.refetch,
  };
}
