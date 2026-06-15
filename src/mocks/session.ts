/**
 * Mock auth session, persisted in localStorage so a signed-in demo survives a
 * page reload without any backend. The login handler sets it, `/auth/me` reads
 * it, logout clears it.
 */
import type { ApiUser } from "@/features/auth/types";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie";

const SESSION_KEY = "mock-session";

/**
 * The server middleware (`proxy.ts`) gates routes on the presence of the auth
 * cookie. In mock mode there is no backend to set it, so we set a readable
 * cookie of the same name on login and clear it on logout.
 */
function setMockCookie(): void {
  if (typeof document !== "undefined") {
    document.cookie = `${ACCESS_TOKEN_COOKIE}=mock-token; path=/; max-age=604800; samesite=lax`;
  }
}

function clearMockCookie(): void {
  if (typeof document !== "undefined") {
    document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0`;
  }
}

export const MOCK_API_USER: ApiUser = {
  id: "usr_dev",
  email: "dev@example.com",
  fullName: "Platform Developer",
  role: "dev",
  roleCode: "DEV",
  permissions: [],
  isActive: true,
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date().toISOString(),
};

export function startSession(user: ApiUser = MOCK_API_USER): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  setMockCookie();
}

export function readSession(): ApiUser | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

export function endSession(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
  clearMockCookie();
}
