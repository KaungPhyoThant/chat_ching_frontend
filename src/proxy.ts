import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie";
import { ROUTES } from "@/config/routes";

const PUBLIC_PATHS = new Set(["/login"]);
const PUBLIC_PREFIXES = ["/portal"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function hasSession(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
      request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = hasSession(request);

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? ROUTES.dashboard : ROUTES.login, request.url),
    );
  }

  // Do not redirect /login → /patients based on cookie alone. An expired JWT still
  // leaves the cookie set until logout runs; client GuestGuard redirects after /auth/me succeeds.

  if (!session && !isPublicPath(pathname)) {
    const login = new URL(ROUTES.login, request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
