import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiBackendUrl } from "@/config/server-env";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/lib/auth/cookie";
import { isApiSuccess } from "@/lib/api/types";

function backendUrl(path: string, search: string): string {
  const base = getApiBackendUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${normalized}${search}`;
}

function forwardRequestHeaders(request: Request): Headers {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);
  return headers;
}

function responseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "application/json",
  );

  for (const name of ["cache-control", "x-accel-buffering"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return headers;
}

interface BackendAuthPayload {
  accessToken: string;
  refreshToken: string;
  user: unknown;
}

function setAuthCookies(
  response: NextResponse,
  { accessToken, refreshToken }: Pick<BackendAuthPayload, "accessToken" | "refreshToken">,
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions());
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions());
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...accessTokenCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...refreshTokenCookieOptions(),
    maxAge: 0,
  });
}

/** Proxies a request to NestJS, attaching the JWT from the httpOnly cookie. */
export async function proxyToBackend(
  request: Request,
  apiPath: string,
  options?: { requireAuth?: boolean },
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const requireAuth = options?.requireAuth ?? true;

  if (requireAuth && !token && !refreshToken) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 401,
        message: "Unauthorized",
        timestamp: new Date().toISOString(),
      },
      { status: 401 },
    );
  }

  const incoming = new URL(request.url);
  const headers = forwardRequestHeaders(request);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  let upstream = await fetch(backendUrl(apiPath, incoming.search), {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  if (requireAuth && upstream.status === 401 && refreshToken) {
    const refreshed = await refreshTokensOnServer(refreshToken);
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed.accessToken}`);
      upstream = await fetch(backendUrl(apiPath, incoming.search), {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      });

      const contentType = upstream.headers.get("content-type") ?? "application/json";
      const isStream = contentType.includes("text/event-stream");
      const responseBody = isStream ? upstream.body : await upstream.text();
      
      const response = new NextResponse(responseBody, {
        status: upstream.status,
        headers: responseHeaders(upstream),
      });
      setAuthCookies(response, refreshed);
      return response;
    }
  }

  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const isStream = contentType.includes("text/event-stream");
  const responseBody = isStream ? upstream.body : await upstream.text();
  
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders(upstream),
  });
}

async function refreshTokensOnServer(
  refreshToken: string,
): Promise<Pick<BackendAuthPayload, "accessToken" | "refreshToken"> | null> {
  const upstream = await fetch(backendUrl("/auth/refresh", ""), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  const raw = await upstream.json();
  if (!upstream.ok || !isApiSuccess(raw)) {
    return null;
  }

  const { accessToken, refreshToken: nextRefresh } = raw.data as BackendAuthPayload;
  return { accessToken, refreshToken: nextRefresh };
}

/** Login: exchange credentials for tokens, store in httpOnly cookies, return user only. */
export async function handleLogin(request: Request): Promise<NextResponse> {
  const body = await request.text();
  const headers = forwardRequestHeaders(request);

  const upstream = await fetch(backendUrl("/auth/login", ""), {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const raw = await upstream.json();

  if (!upstream.ok || !isApiSuccess(raw)) {
    return NextResponse.json(raw, { status: upstream.status });
  }

  const { accessToken, refreshToken, user } = raw.data as BackendAuthPayload;
  const response = NextResponse.json({
    success: true,
    data: { user },
    timestamp: new Date().toISOString(),
  });

  setAuthCookies(response, { accessToken, refreshToken });
  return response;
}

/** Refresh: exchange refresh cookie for new tokens. */
export async function handleRefresh(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 401,
        message: "Unauthorized",
        timestamp: new Date().toISOString(),
      },
      { status: 401 },
    );
  }

  const tokens = await refreshTokensOnServer(refreshToken);
  if (!tokens) {
    const response = NextResponse.json(
      {
        success: false,
        statusCode: 401,
        message: "Invalid or expired refresh token",
        timestamp: new Date().toISOString(),
      },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({
    success: true,
    data: { ok: true },
    timestamp: new Date().toISOString(),
  });
  setAuthCookies(response, tokens);
  return response;
}

/** Logout: clear session cookies. */
export function handleLogout(): NextResponse {
  const response = NextResponse.json({
    success: true,
    data: { ok: true },
    timestamp: new Date().toISOString(),
  });
  clearAuthCookies(response);
  return response;
}
