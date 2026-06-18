import { http } from "msw";
import { fail, ok } from "../envelope";
import { db } from "../db";
import { daysAgo, nextId } from "../db/store";
import type { Promotion } from "@/features/promotions/types";
import type { Broadcast } from "@/features/broadcasts/types";

export const marketingHandlers = [
  // ---- Promotions ----
  http.get("/api/promotions", () => ok(db.promotions.all())),

  http.post("/api/promotions", async ({ request }) => {
    const body = (await request.json()) as Partial<Promotion>;
    const promotion: Promotion = {
      id: nextId("promo"),
      code: (body.code ?? "NEWCODE").toUpperCase(),
      type: body.type ?? "PERCENT",
      value: Number(body.value ?? 0),
      minSpend: body.minSpend,
      maxUses: body.maxUses,
      usedCount: 0,
      startsAt: body.startsAt,
      expiresAt: body.expiresAt,
      isActive: body.isActive ?? true,
    };
    db.promotions.insert(promotion);
    return ok(promotion);
  }),

  http.patch("/api/promotions/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<Promotion>;
    if (body.code) body.code = body.code.toUpperCase();
    const updated = db.promotions.update(String(params.id), body);
    return updated ? ok(updated) : fail(404, "Promotion not found");
  }),

  http.delete("/api/promotions/:id", ({ params }) => {
    const removed = db.promotions.remove(String(params.id));
    return removed ? ok(removed) : fail(404, "Promotion not found");
  }),

  // ---- Broadcasts ----
  http.get("/api/broadcasts", () => ok(db.broadcasts.all())),

  http.post("/api/broadcasts", async ({ request }) => {
    const body = (await request.json()) as Partial<Broadcast>;
    const broadcast: Broadcast = {
      id: nextId("bct"),
      title: body.title ?? "Untitled broadcast",
      body: body.body ?? "",
      imageUrl: body.imageUrl,
      segment: body.segment ?? "All customers",
      status: body.scheduledAt ? "SCHEDULED" : "DRAFT",
      recipientCount: 0,
      scheduledAt: body.scheduledAt,
      createdAt: daysAgo(0),
    };
    db.broadcasts.insert(broadcast);
    return ok(broadcast);
  }),

  http.patch("/api/broadcasts/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<Broadcast>;
    const updated = db.broadcasts.update(String(params.id), body);
    return updated ? ok(updated) : fail(404, "Broadcast not found");
  }),

  http.post("/api/broadcasts/:id/send", ({ params }) => {
    const updated = db.broadcasts.update(String(params.id), {
      status: "SENT",
      sentAt: daysAgo(0),
      recipientCount: 800 + Math.floor(Math.random() * 600),
    });
    return updated ? ok(updated) : fail(404, "Broadcast not found");
  }),

  // Conversations are served by the real backend (MSW bypassed) so the bot's
  // live chats appear here. See ai-customer-support-backend ConversationsController.
];
