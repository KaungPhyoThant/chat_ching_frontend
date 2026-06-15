import { http } from "msw";
import { ok } from "../envelope";
import { db } from "../db";
import type { Capabilities } from "@/features/capabilities/types";

export const capabilitiesHandlers = [
  http.get("/api/settings/capabilities", () => ok(db.capabilities.current)),

  http.patch("/api/settings/capabilities", async ({ request }) => {
    const patch = (await request.json()) as Partial<Capabilities>;
    db.capabilities.current = { ...db.capabilities.current, ...patch };
    return ok(db.capabilities.current);
  }),
];
