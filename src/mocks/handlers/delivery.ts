import { http } from "msw";
import { fail, ok } from "../envelope";
import { db } from "../db";
import { nextId } from "../db/store";
import { resolveDeliveryFee } from "@/lib/delivery/resolve-fee";
import type { City, Region, Township } from "@/features/delivery/types";

const query = (url: string, key: string) =>
  new URL(url).searchParams.get(key) ?? undefined;

export const deliveryHandlers = [
  // ---- Regions ----
  http.get("/api/delivery/regions", () => ok(db.regions.all())),
  http.post("/api/delivery/regions", async ({ request }) => {
    const b = (await request.json()) as Partial<Region>;
    const region: Region = {
      id: nextId("reg"),
      name: b.name ?? "New region",
      deliveryFee: b.deliveryFee ?? null,
      isActive: b.isActive ?? true,
    };
    db.regions.insert(region);
    return ok(region);
  }),
  http.patch("/api/delivery/regions/:id", async ({ params, request }) => {
    const b = (await request.json()) as Partial<Region>;
    const updated = db.regions.update(String(params.id), b);
    return updated ? ok(updated) : fail(404, "Region not found");
  }),
  http.delete("/api/delivery/regions/:id", ({ params }) => {
    const id = String(params.id);
    if (db.cities.all().some((c) => c.regionId === id)) {
      return fail(409, "Region has cities — delete those first");
    }
    const removed = db.regions.remove(id);
    return removed ? ok(removed) : fail(404, "Region not found");
  }),

  // ---- Cities ----
  http.get("/api/delivery/cities", ({ request }) => {
    const regionId = query(request.url, "regionId");
    const rows = db.cities.all().filter((c) => !regionId || c.regionId === regionId);
    return ok(rows);
  }),
  http.post("/api/delivery/cities", async ({ request }) => {
    const b = (await request.json()) as Partial<City>;
    const city: City = {
      id: nextId("city"),
      regionId: b.regionId ?? "",
      name: b.name ?? "New city",
      deliveryFee: b.deliveryFee ?? null,
      isActive: b.isActive ?? true,
    };
    db.cities.insert(city);
    return ok(city);
  }),
  http.patch("/api/delivery/cities/:id", async ({ params, request }) => {
    const b = (await request.json()) as Partial<City>;
    const updated = db.cities.update(String(params.id), b);
    return updated ? ok(updated) : fail(404, "City not found");
  }),
  http.delete("/api/delivery/cities/:id", ({ params }) => {
    const id = String(params.id);
    if (db.townships.all().some((t) => t.cityId === id)) {
      return fail(409, "City has townships — delete those first");
    }
    const removed = db.cities.remove(id);
    return removed ? ok(removed) : fail(404, "City not found");
  }),

  // ---- Townships ----
  http.get("/api/delivery/townships", ({ request }) => {
    const cityId = query(request.url, "cityId");
    const rows = db.townships.all().filter((t) => !cityId || t.cityId === cityId);
    return ok(rows);
  }),
  http.post("/api/delivery/townships", async ({ request }) => {
    const b = (await request.json()) as Partial<Township>;
    const township: Township = {
      id: nextId("tsp"),
      cityId: b.cityId ?? "",
      name: b.name ?? "New township",
      deliveryFee: b.deliveryFee ?? null,
      isActive: b.isActive ?? true,
    };
    db.townships.insert(township);
    return ok(township);
  }),
  http.patch("/api/delivery/townships/:id", async ({ params, request }) => {
    const b = (await request.json()) as Partial<Township>;
    const updated = db.townships.update(String(params.id), b);
    return updated ? ok(updated) : fail(404, "Township not found");
  }),
  http.delete("/api/delivery/townships/:id", ({ params }) => {
    const removed = db.townships.remove(String(params.id));
    return removed ? ok(removed) : fail(404, "Township not found");
  }),

  // ---- Fee quote ----
  http.get("/api/delivery/quote/:townshipId", ({ params }) =>
    ok(
      resolveDeliveryFee(String(params.townshipId), {
        townships: db.townships.all(),
        cities: db.cities.all(),
        regions: db.regions.all(),
      }),
    ),
  ),
];
