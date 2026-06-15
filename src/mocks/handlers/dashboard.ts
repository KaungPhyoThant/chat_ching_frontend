import { http } from "msw";
import { ok } from "../envelope";
import { db } from "../db";
import type { DashboardStats } from "@/features/dashboard/types";

const PAID_STATUSES = ["PAID", "PACKED", "SHIPPED", "DELIVERED"];
const OPEN_STATUSES = ["PENDING", "CONFIRMED", "PAID", "PACKED"];

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export const dashboardHandlers = [
  http.get("/api/dashboard/stats", () => {
    const orders = db.orders.all();
    const products = db.products.all();

    const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.status));

    // Revenue per day for the last 14 days.
    const series: { date: string; revenue: number }[] = [];
    for (let d = 13; d >= 0; d -= 1) {
      const date = new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
      const revenue = paidOrders
        .filter((o) => dayKey(o.createdAt) === date)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      series.push({ date, revenue });
    }

    const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    const todayKey = new Date().toISOString().slice(0, 10);

    const stats: DashboardStats = {
      ordersToday: orders.filter((o) => dayKey(o.createdAt) === todayKey).length,
      revenueToday: paidOrders
        .filter((o) => dayKey(o.createdAt) === todayKey)
        .reduce((sum, o) => sum + o.totalAmount, 0),
      pendingOrders: orders.filter((o) => OPEN_STATUSES.includes(o.status)).length,
      lowStock: products.filter((p) => p.stock < 10).length,
      revenueSeries: series,
      ordersByStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      recentOrders: [...orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6)
        .map((o) => ({
          id: o.id,
          orderNo: o.orderNo,
          customerName: o.customerName,
          status: o.status,
          totalAmount: o.totalAmount,
          createdAt: o.createdAt,
        })),
    };

    return ok(stats);
  }),
];
