import { handleLogin } from "@/lib/server/backend-proxy";

export async function POST(request: Request) {
  return handleLogin(request);
}
