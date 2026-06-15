import { proxyToBackend } from "@/lib/server/backend-proxy";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const apiPath = `/${path.join("/")}`;
  return proxyToBackend(request, apiPath);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
