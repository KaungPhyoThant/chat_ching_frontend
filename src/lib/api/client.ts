import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/env";
import { clearAuthSession } from "@/lib/auth/clear-session";
import { refreshSession } from "@/lib/auth/refresh-session";
import { isApiSuccess, type ApiErrorBody, type PaginationMeta } from "./types";

declare module "axios" {
  export interface AxiosResponse {
    meta?: PaginationMeta;
  }
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Same-origin API client. JWT is sent via httpOnly cookie on each request.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

function isAuthExemptRequest(url: string | undefined): boolean {
  return Boolean(
    url?.includes("/auth/login") ||
    url?.includes("/auth/logout") ||
    url?.includes("/auth/refresh"),
  );
}

let handlingUnauthorized = false;

apiClient.interceptors.response.use(
  (response) => {
    const body: unknown = response.data;
    if (isApiSuccess(body)) {
      response.data = body.data;
      response.meta = body.meta;
    }
    return response;
  },
  async (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : (rawMessage ?? error.message ?? "Unexpected error");

    const config = error.config as RetryableConfig | undefined;

    if (
      status === 401 &&
      config &&
      !config._retry &&
      !isAuthExemptRequest(config.url) &&
      typeof window !== "undefined"
    ) {
      const refreshed = await refreshSession();
      if (refreshed) {
        config._retry = true;
        return apiClient.request(config);
      }

      if (!handlingUnauthorized) {
        handlingUnauthorized = true;
        try {
          await clearAuthSession();
          const pathname = window.location.pathname;
          const isPublic =
            pathname.startsWith("/login") ||
            pathname.startsWith("/telegram-shop") ||
            pathname.startsWith("/portal");
          if (!isPublic) {
            window.location.replace("/login");
          }
        } finally {
          handlingUnauthorized = false;
        }
      }
    }

    const normalized: ApiError = {
      status,
      message,
    };
    return Promise.reject(normalized);
  },
);

export interface ApiError {
  status: number;
  message: string;
}
