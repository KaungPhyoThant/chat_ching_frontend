"use client";

import { OrderHistoryEntry } from "../types";

interface OrderHistoryDrawerProps {
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
  ordersLoading: boolean;
  orders: OrderHistoryEntry[];
  t: (key: string) => string;
  onPayNow?: (o: OrderHistoryEntry) => void;
}

export default function OrderHistoryDrawer({
  showOrders,
  setShowOrders,
  ordersLoading,
  orders,
  t,
  onPayNow,
}: OrderHistoryDrawerProps) {
  if (!showOrders) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-title">{t("orderHistory")}</span>
          <button className="close-btn" onClick={() => setShowOrders(false)}>
            ✕
          </button>
        </div>

        {ordersLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>{t("loading")}</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>{t("noOrders")}</div>
        ) : (
          <div className="cart-list">
            {orders.map((o) => (
              <div key={o.orderNo} className="order-card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>#{o.orderNo}</span>
                  <span className="order-status">{o.status}</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0" }}>
                  {new Date(o.createdAt).toLocaleDateString()}
                </div>
                {o.items.map((i: { name: string; quantity: number; unitPrice?: number; total: number }, idx: number) => (
                  <div key={`${i.name}-${idx}`} style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    • {i.name} ×{i.quantity}
                    {i.unitPrice ? ` @ ${i.unitPrice.toLocaleString()}` : ""} —{" "}
                    {i.total.toLocaleString()} Ks
                  </div>
                ))}
                {o.paymentMethod && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                    {t("payment")}: {o.paymentMethod}
                    {o.paymentStatus ? ` · ${o.paymentStatus}` : ""}
                  </div>
                )}
                {o.shippingAddress && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {t("shipTo")}: {o.shippingAddress}
                  </div>
                )}
                <div style={{ textAlign: "right", fontWeight: 700, marginTop: "6px" }}>
                  {t("total")}: {o.total.toLocaleString()} Ks
                </div>
                {o.status === "PENDING" && onPayNow && (
                  <button
                    className="btn-add"
                    style={{ marginTop: 8 }}
                    onClick={() => onPayNow(o)}
                  >
                    {t("payNow")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
