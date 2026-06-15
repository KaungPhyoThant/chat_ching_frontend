import { HttpResponse } from "msw";
import type { PaginationMeta } from "@/lib/api/types";

/**
 * Mirror the backend `TransformInterceptor` / `HttpExceptionFilter` envelope so
 * MSW responses are byte-compatible with production. The axios interceptor
 * unwraps these the same way for both.
 */

export function ok<T>(data: T, meta?: PaginationMeta) {
  return HttpResponse.json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  });
}

export function fail(status: number, message: string) {
  return HttpResponse.json(
    {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

export function notFound(message = "Not found") {
  return fail(404, message);
}
