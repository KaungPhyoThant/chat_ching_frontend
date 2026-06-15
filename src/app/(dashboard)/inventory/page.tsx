"use client";

import { useMemo, useState } from "react";
import { App, Button, InputNumber, Modal, Segmented, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { useProducts, useUpdateProduct } from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types";

type StockFilter = "all" | "low" | "out";

export default function InventoryPage() {
  const { message } = App.useApp();
  const { data: products = [], isLoading } = useProducts();
  const updateMutation = useUpdateProduct();

  const [filter, setFilter] = useState<StockFilter>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [stock, setStock] = useState(0);

  const rows = useMemo(
    () =>
      products.filter((p) => {
        if (filter === "low") return p.stock > 0 && p.stock < 10;
        if (filter === "out") return p.stock === 0;
        return true;
      }),
    [products, filter],
  );

  const save = async () => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({ id: editing.id, payload: { stock } });
      message.success(`Stock updated for ${editing.name}`);
      setEditing(null);
    } catch {
      message.error("Failed to update stock");
    }
  };

  const columns: ColumnsType<Product> = [
    { title: "Product", dataIndex: "name" },
    { title: "SKU", dataIndex: "sku" },
    { title: "Category", dataIndex: "categoryName" },
    {
      title: "In stock",
      dataIndex: "stock",
      align: "center",
      sorter: (a, b) => a.stock - b.stock,
      render: (s: number) =>
        s === 0 ? <Tag color="red">0</Tag> : s < 10 ? <Tag color="orange">{s}</Tag> : <Tag color="green">{s}</Tag>,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, p) => (
        <Button size="small" onClick={() => { setEditing(p); setStock(p.stock); }}>
          Adjust
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Inventory" subtitle="Stock levels across the catalog" />
      <ContentCard
        toolbar={
          <Space style={{ padding: 16 }}>
            <Segmented
              value={filter}
              onChange={(v) => setFilter(v as StockFilter)}
              options={[
                { label: "All", value: "all" },
                { label: "Low stock", value: "low" },
                { label: "Out of stock", value: "out" },
              ]}
            />
          </Space>
        }
      >
        <DataTable<Product> rowKey="id" loading={isLoading} columns={columns} dataSource={rows} />
      </ContentCard>

      <Modal
        open={!!editing}
        title={`Adjust stock — ${editing?.name ?? ""}`}
        okText="Save"
        onOk={save}
        onCancel={() => setEditing(null)}
        confirmLoading={updateMutation.isPending}
      >
        <InputNumber min={0} value={stock} onChange={(v) => setStock(v ?? 0)} style={{ width: "100%" }} autoFocus />
      </Modal>
    </>
  );
}
