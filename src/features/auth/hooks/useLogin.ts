"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, type LoginRequest } from "../api/auth-api";
import { toCurrentUser } from "../mappers";
import { authQueryKeys } from "./useCurrentUser";
import { useAuthStore } from "@/store/auth-store";

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: ({ user }) => {
      const current = toCurrentUser(user);
      setUser(current);
      queryClient.setQueryData(authQueryKeys.me, current);
    },
  });
}
