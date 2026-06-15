/**
 * Response envelope contract shared with the NestJS backend
 * (`TransformInterceptor` / `HttpExceptionFilter`). The axios response
 * interceptor unwraps `ApiSuccess.data` so callers receive the payload
 * directly; pagination `meta` is surfaced separately on the axios response.
 */

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
  requestId?: string;
}

/** Narrow an unknown response body to the success envelope. */
export function isApiSuccess(body: unknown): body is ApiSuccess<unknown> {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { success?: unknown }).success === true &&
    "data" in body
  );
}
