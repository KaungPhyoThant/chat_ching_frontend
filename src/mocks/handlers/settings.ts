import { http } from "msw";
import { ok } from "../envelope";
import { db } from "../db";
import type { CompanyInfo } from "@/features/settings/types";

export const settingsHandlers = [
  http.get("/api/settings/company", () => ok(db.companyInfo.current)),

  http.patch("/api/settings/company", async ({ request }) => {
    const patch = (await request.json()) as Partial<CompanyInfo>;
    db.companyInfo.current = { ...db.companyInfo.current, ...patch };
    return ok(db.companyInfo.current);
  }),
];
