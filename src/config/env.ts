/**
 * Browser API base — must be same-origin `/api` so httpOnly cookies are sent.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api";

const truthy = new Set(["1", "true", "yes", "on"]);
const falsy = new Set(["0", "false", "no", "off"]);

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (truthy.has(normalized)) return true;
  if (falsy.has(normalized)) return false;
  return fallback;
}

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
const mswEnabled = readBoolean(
  process.env.NEXT_PUBLIC_MSW_ENABLED,
  isDevelopment,
);

export const ENV = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  mswEnabled,
  mockAuthToken:
    !isProduction && mswEnabled
      ? (process.env.NEXT_PUBLIC_MOCK_AUTH_TOKEN ?? "mock-token")
      : undefined,
  devLoggingEnabled:
    !isProduction &&
    readBoolean(process.env.NEXT_PUBLIC_DEV_LOGGING_ENABLED, true),
} as const;
