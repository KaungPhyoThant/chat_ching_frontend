"use client";

import { useState } from "react";
import { App, Button, InputNumber, List, Statistic, Tag } from "antd";
import { formatDate } from "@/lib/format";
import { useCustomerLoyalty, useAdjustPoints } from "../hooks/useLoyalty";
import type { LoyaltyTxnType } from "../types";

const TYPE_COLOR: Record<LoyaltyTxnType, string> = {
  EARN: "green",
  REDEEM: "orange",
  ADJUST: "blue",
};

export function CustomerLoyaltyPanel({ customerId }: { customerId: string }) {
  const { message } = App.useApp();
  const { data } = useCustomerLoyalty(customerId);
  const adjust = useAdjustPoints(customerId);
  const [delta, setDelta] = useState<number | null>(null);

  const apply = async () => {
    if (!delta) return;
    try {
      await adjust.mutateAsync({ points: delta, note: "Manual adjustment" });
      setDelta(null);
      message.success("Points adjusted");
    } catch {
      message.error("Failed to adjust points");
    }
  };

  return (
    <div>
      <strong>Loyalty points</strong>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
        <Statistic value={data?.balance ?? 0} suffix="pts" />
        <InputNumber
          value={delta}
          onChange={setDelta}
          placeholder="+/− points"
          style={{ width: 130 }}
        />
        <Button onClick={apply} loading={adjust.isPending} disabled={!delta}>
          Adjust
        </Button>
      </div>
      <List
        size="small"
        dataSource={data?.transactions ?? []}
        locale={{ emptyText: "No point history" }}
        renderItem={(tx) => (
          <List.Item>
            <Tag color={TYPE_COLOR[tx.type]}>{tx.type}</Tag>
            <span style={{ fontWeight: 600 }}>
              {tx.points > 0 ? `+${tx.points}` : tx.points}
            </span>
            <span style={{ color: "var(--app-text-muted)" }}>
              {tx.orderNo ?? tx.note ?? ""}
            </span>
            <span style={{ color: "var(--app-text-muted)" }}>
              {formatDate(tx.createdAt)}
            </span>
          </List.Item>
        )}
      />
    </div>
  );
}
