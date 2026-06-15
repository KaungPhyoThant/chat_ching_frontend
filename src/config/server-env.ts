import "server-only";

/**
 * NestJS origin for server-side route handlers (never exposed to the client).
 */
export function getApiBackendUrl(): string {
  const apiBackendUrl = process.env.API_BACKEND_URL?.trim();

  if (!apiBackendUrl) {
    throw new Error("API_BACKEND_URL environment variable is required");
  }

  return apiBackendUrl.replace(/\/$/, "");
}
