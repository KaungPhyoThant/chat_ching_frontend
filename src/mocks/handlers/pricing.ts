import { http } from "msw";
import { fail, ok } from "../envelope";
import { db } from "../db";
import { nextId } from "../db/store";
import type { PriceList } from "@/features/pricing/types";

export const pricingHandlers = [
  http.get("/api/customer-groups", () => ok(db.customerGroups.all())),
  http.get("/api/price-lists", () => ok(db.priceLists.all())),

  http.post("/api/price-lists", async ({ request }) => {
    const body = (await request.json()) as Partial<PriceList>;
    const pl: PriceList = {
      id: nextId("pl"),
      name: body.name ?? "New price list",
      currency: body.currency ?? "MMK",
      customerGroupId: body.customerGroupId ?? null,
      isDefault: false,
      priority: body.priority ?? 1,
      isActive: body.isActive ?? true,
      items: body.items ?? [],
    };
    db.priceLists.insert(pl);
    return ok(pl);
  }),

  http.patch("/api/price-lists/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<PriceList>;
    const updated = db.priceLists.update(String(params.id), body);
    return updated ? ok(updated) : fail(404, "Price list not found");
  }),
];
