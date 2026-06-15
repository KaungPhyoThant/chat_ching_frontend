/** httpOnly cookie holding the NestJS access JWT — never exposed to client JavaScript. */
export const ACCESS_TOKEN_COOKIE = "emr_access_token";

/** httpOnly cookie holding the NestJS refresh JWT. */
export const REFRESH_TOKEN_COOKIE = "emr_refresh_token";

/** Access cookie max-age in seconds (default 15m — align with backend JWT_EXPIRES_IN). */
export const ACCESS_TOKEN_MAX_AGE = Number(
  process.env.AUTH_ACCESS_MAX_AGE ?? 15 * 60,
);

/** Refresh cookie max-age in seconds (default 7d — align with JWT_REFRESH_EXPIRES_IN). */
export const REFRESH_TOKEN_MAX_AGE = Number(
  process.env.AUTH_REFRESH_MAX_AGE ?? 60 * 60 * 24 * 7,
);

export function accessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  };
}

export function refreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  };
}
