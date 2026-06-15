"use client";

import { useMemo, useState } from "react";
import {
  App,
  Descriptions,
  Drawer,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { ORDER_STATUS, type OrderStatus } from "@/config/enums";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { useOrders, useUpdateOrderStatus } from "@/features/orders/hooks/useOrders";
import type { Order, OrderItem } from "@/features/orders/types";

const STATUS_OPTIONS = (Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => ({
  label: s,
  value: s,
}));

function StatusTag({ status }: { status: string }) {
  const meta = ORDER_STATUS[status as OrderStatus];
  return <Tag color={meta?.color}>{status}</Tag>;
}

export default function OrdersPage() {
  const { message } = App.useApp();
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [selected, setSelected] = useState<Order | null>(null);

  const rows = useMemo(
    () => (statusFilter ? orders.filter((o) => o.status === statusFilter) : orders),
    [orders, statusFilter],
  );

  // Keep the open drawer in sync with refreshed data.
  const current = selected ? orders.find((o) => o.id === selected.id) ?? selected : null;

  const changeStatus = async (status: OrderStatus) => {
    if (!current) return;
    try {
      await updateStatus.mutateAsync({ id: current.id, status });
      message.success(`Order ${current.orderNo} → ${status}`);
    } catch {
      message.error("Failed to update status");
    }
  };

  const columns: ColumnsType<Order> = [
    { title: "Order", dataIndex: "orderNo", render: (v: string) => <strong>{v}</strong> },
    { title: "Customer", dataIndex: "customerName" },
    { title: "Status", dataIndex: "status", render: (s: string) => <StatusTag status={s} /> },
    {
      title: "Total",
      dataIndex: "totalAmount",
      align: "right",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (v: number) => formatCurrency(v),
    },
    { title: "Date", dataIndex: "createdAt", render: (v: string) => formatDate(v) },
  ];

  const itemColumns: ColumnsType<OrderItem> = [
    { title: "Product", dataIndex: "productName" },
    { title: "Qty", dataIndex: "quantity", align: "center" },
    { title: "Unit", dataIndex: "unitPrice", align: "right", render: (v: number) => formatCurrency(v) },
    { title: "Total", dataIndex: "lineTotal", align: "right", render: (v: number) => formatCurrency(v) },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="Track and fulfill customer orders" />
      <ContentCard
        toolbar={
          <Space style={{ padding: 16 }}>
            <FilterSelect
              placeholder="All statuses"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={STATUS_OPTIONS}
            />
          </Space>
        }
      >
        <DataTable<Order>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={rows}
          onRow={(record) => ({ onClick: () => setSelected(record), style: { cursor: "pointer" } })}
        />
      </ContentCard>

      <Drawer
        size={560}
        open={!!current}
        onClose={() => setSelected(null)}
        title={current ? `Order ${current.orderNo}` : ""}
      >
        {current && (
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <Space align="center">
              <span>Status:</span>
              <Select
                value={current.status}
                options={STATUS_OPTIONS}
                style={{ width: 180 }}
                onChange={(v) => changeStatus(v)}
                loading={updateStatus.isPending}
              />
            </Space>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Customer">{current.customerName}</Descriptions.Item>
              <Descriptions.Item label="Shipping">{current.shippingAddress ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Payment">
                {current.payment.method} · <StatusTag status={current.payment.status} />
              </Descriptions.Item>
              {current.promotionCode && (
                <Descriptions.Item label="Promo">{current.promotionCode}</Descriptions.Item>
              )}
            </Descriptions>

            <Table<OrderItem>
              rowKey="id"
              size="small"
              pagination={false}
              columns={itemColumns}
              dataSource={current.items}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>Subtotal</Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">{formatCurrency(current.subtotal)}</Table.Summary.Cell>
                  </Table.Summary.Row>
                  {current.discountAmount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>Discount</Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">−{formatCurrency(current.discountAmount)}</Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}><strong>Total</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right"><strong>{formatCurrency(current.totalAmount)}</strong></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            <Timeline
              items={current.timeline.map((e) => ({
                children: (
                  <Space>
                    <StatusTag status={e.status} />
                    <span style={{ color: "var(--app-text-muted)" }}>{formatDateTime(e.at)}</span>
                  </Space>
                ),
              }))}
            />
          </Space>
        )}
      </Drawer>
    </>
  );
}
