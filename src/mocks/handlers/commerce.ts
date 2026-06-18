import { http } from "msw";
import { fail, ok } from "../envelope";
import { db } from "../db";
import { daysAgo } from "../db/store";
import type { Order, OrderStatus } from "@/features/orders/types";

export const commerceHandlers = [
  // ---- Orders ----
  http.get("/api/orders", () => ok(db.orders.all())),

  http.get("/api/orders/:id", ({ params }) => {
    const order = db.orders.find(String(params.id));
    return order ? ok(order) : fail(404, "Order not found");
  }),

  http.patch("/api/orders/:id/status", async ({ params, request }) => {
    const { status } = (await request.json()) as { status: OrderStatus };
    const order = db.orders.find(String(params.id));
    if (!order) return fail(404, "Order not found");
    order.status = status;
    order.timeline = [...order.timeline, { status, at: daysAgo(0) }];
    if (["PAID", "PACKED", "SHIPPED", "DELIVERED"].includes(status)) {
      order.payment = { ...order.payment, status: "SUCCESS", paidAt: order.payment.paidAt ?? daysAgo(0) };
    }
    if (status === "REFUNDED") {
      order.payment = { ...order.payment, status: "REFUNDED" };
    }
    return ok(order as Order);
  }),
];
