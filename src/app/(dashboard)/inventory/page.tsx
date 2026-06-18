"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  InputNumber,
  Modal,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import {
  useAdjustProductStock,
  useProducts,
} from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types";

type StockFilter = "all" | "low" | "out";

export default function InventoryPage() {
  const { message } = App.useApp();
  const { data: products = [], isLoading } = useProducts();
  const adjustStockMutation = useAdjustProductStock();

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

  const openAdjustment = (product: Product) => {
    setEditing(product);
    setStock(product.stock);
  };

  const isStockInvalid = !Number.isInteger(stock) || stock < 0;

  const save = async () => {
    if (!editing || isStockInvalid) return;
    try {
      await adjustStockMutation.mutateAsync({ id: editing.id, stock });
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
        s === 0 ? (
          <Tag color="red">0</Tag>
        ) : s < 10 ? (
          <Tag color="orange">{s}</Tag>
        ) : (
          <Tag color="green">{s}</Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, p) => (
        <Button size="small" onClick={() => openAdjustment(p)}>
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
        <DataTable<Product>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={rows}
        />
      </ContentCard>

      <Modal
        open={!!editing}
        title={`Adjust stock - ${editing?.name ?? ""}`}
        okText="Save"
        onOk={save}
        onCancel={() => setEditing(null)}
        okButtonProps={{ disabled: isStockInvalid }}
        confirmLoading={adjustStockMutation.isPending}
      >
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            Current stock: {editing?.stock ?? 0}
          </Typography.Text>
          <InputNumber
            min={0}
            precision={0}
            value={stock}
            onChange={(v) => setStock(v ?? 0)}
            status={isStockInvalid ? "error" : undefined}
            style={{ width: "100%" }}
            autoFocus
          />
        </Space>
      </Modal>
    </>
  );
}
