import { useAuthStore } from "@/store/auth-store";

let logoutInFlight: Promise<void> | null = null;

/**
 * Clears in-memory user state and the httpOnly JWT cookie (via BFF logout).
 * Deduplicated so parallel 401s do not spam logout or cause redirect loops.
 */
export async function clearAuthSession(): Promise<void> {
  useAuthStore.getState().clearSession();

  if (!logoutInFlight) {
    logoutInFlight = fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .catch(() => undefined)
      .then(() => undefined)
      .finally(() => {
        logoutInFlight = null;
      });
  }

  await logoutInFlight;
}
