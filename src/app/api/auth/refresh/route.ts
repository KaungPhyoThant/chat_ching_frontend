import { handleRefresh } from "@/lib/server/backend-proxy";

export async function POST() {
  return handleRefresh();
}
