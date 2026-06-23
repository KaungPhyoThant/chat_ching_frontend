import { proxyToBackend } from "@/lib/server/backend-proxy";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const apiPath = `/${path.join("/")}`;
  
  // Public bot endpoints used by the Telegram Mini App do not require admin authentication
  const isPublicBotRoute =
    apiPath.startsWith("/bot/products") ||
    apiPath.startsWith("/bot/delivery-regions") ||
    apiPath.startsWith("/bot/mini-app-checkout") ||
    apiPath.startsWith("/bot/cart");

  return proxyToBackend(request, apiPath, { requireAuth: !isPublicBotRoute });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
