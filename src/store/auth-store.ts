import { create } from "zustand";
import type { CurrentUser } from "@/lib/rbac/current-user";

interface AuthState {
  user: CurrentUser | null;
  setUser: (user: CurrentUser) => void;
  clearSession: () => void;
}

/**
 * In-memory session user only. The JWT lives in an httpOnly cookie (see app/api/auth).
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearSession: () => set({ user: null }),
}));
