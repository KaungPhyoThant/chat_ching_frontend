"use client";

import { useMemo, useState } from "react";
import { App, Button, Descriptions, Drawer, Input, List, Select, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  useCustomer,
  useCustomers,
  useUpdateCustomer,
} from "@/features/customers/hooks/useCustomers";
import { useFeature } from "@/lib/features/useFeature";
import { useCustomerGroups } from "@/features/pricing/hooks/usePricing";
import type { Customer } from "@/features/customers/types";

export default function CustomersPage() {
  const { message } = App.useApp();
  const { data: customers = [], isLoading } = useCustomers();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: detail } = useCustomer(selectedId);
  const updateMutation = useUpdateCustomer();
  const showGroups = useFeature("customerGroups");
  const { data: groups = [] } = useCustomerGroups();

  const rows = useMemo(
    () =>
      customers.filter(
        (c) =>
          !search ||
          c.fullName.toLowerCase().includes(search.toLowerCase()) ||
          (c.username ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [customers, search],
  );

  const toggleBlock = async (c: Customer) => {
    try {
      await updateMutation.mutateAsync({ id: c.id, payload: { isBlocked: !c.isBlocked } });
      message.success(c.isBlocked ? "Customer unblocked" : "Customer blocked");
    } catch {
      message.error("Failed to update customer");
    }
  };

  const columns: ColumnsType<Customer> = [
    {
      title: "Customer",
      dataIndex: "fullName",
      render: (_, c) => (
        <div>
          <div style={{ fontWeight: 500 }}>{c.fullName}</div>
          <span style={{ fontSize: 12, color: "var(--app-text-muted)" }}>@{c.username}</span>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "phone" },
    { title: "City", dataIndex: "address" },
    { title: "Orders", dataIndex: "orderCount", align: "center" },
    { title: "Spent", dataIndex: "totalSpent", align: "right", render: (v: number) => formatCurrency(v) },
    {
      title: "Status",
      dataIndex: "isBlocked",
      render: (b: boolean) => (b ? <Tag color="red">Blocked</Tag> : <Tag color="green">Active</Tag>),
    },
  ];

  return (
    <>
      <PageHeader title="Customers" subtitle="Telegram buyers and their activity" />
      <ContentCard
        toolbar={
          <Space style={{ padding: 16 }}>
            <Input.Search
              allowClear
              placeholder="Search name or @username"
              style={{ width: 260 }}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Space>
        }
      >
        <DataTable<Customer>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={rows}
          onRow={(record) => ({ onClick: () => setSelectedId(record.id), style: { cursor: "pointer" } })}
        />
      </ContentCard>

      <Drawer size={520} open={!!selectedId} onClose={() => setSelectedId(null)} title={detail?.fullName}>
        {detail && (
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Telegram ID">{detail.telegramId}</Descriptions.Item>
              <Descriptions.Item label="Username">@{detail.username}</Descriptions.Item>
              <Descriptions.Item label="Phone">{detail.phone ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Address">{detail.address ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Language">{detail.languageCode}</Descriptions.Item>
            </Descriptions>

            {showGroups && (
              <div>
                <div style={{ marginBottom: 6, fontWeight: 500 }}>Customer group</div>
                <Select
                  style={{ width: 240 }}
                  value={detail.groupId}
                  placeholder="Select group"
                  options={groups.map((g) => ({ label: g.name, value: g.id }))}
                  onChange={(groupId) =>
                    updateMutation.mutate({ id: detail.id, payload: { groupId } })
                  }
                />
              </div>
            )}

            <Button danger={!detail.isBlocked} onClick={() => toggleBlock(detail)} loading={updateMutation.isPending}>
              {detail.isBlocked ? "Unblock customer" : "Block customer"}
            </Button>

            <div>
              <strong>Orders ({detail.orders.length})</strong>
              <List
                size="small"
                dataSource={detail.orders}
                locale={{ emptyText: "No orders" }}
                renderItem={(o) => (
                  <List.Item>
                    <span>{o.orderNo}</span>
                    <Tag>{o.status}</Tag>
                    <span>{formatCurrency(o.totalAmount)}</span>
                    <span style={{ color: "var(--app-text-muted)" }}>{formatDate(o.createdAt)}</span>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <strong>Conversations ({detail.conversations.length})</strong>
              <List
                size="small"
                dataSource={detail.conversations}
                locale={{ emptyText: "No conversations" }}
                renderItem={(c) => (
                  <List.Item>
                    <span>{c.intent}</span>
                    {c.needsHandoff ? <Tag color="red">Handoff</Tag> : <Tag color="blue">Bot</Tag>}
                  </List.Item>
                )}
              />
            </div>
          </Space>
        )}
      </Drawer>
    </>
  );
}
