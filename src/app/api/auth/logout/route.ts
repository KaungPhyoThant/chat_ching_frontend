import { handleLogout } from "@/lib/server/backend-proxy";

export async function POST() {
  return handleLogout();
}
