"use client";

import { useMemo, useState } from "react";
import { App, Avatar, Button, Input, Modal, Popconfirm, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateButton } from "@/components/ui/CreateButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { formatCurrency } from "@/lib/format";
import { useProducts, useDeleteProduct } from "@/features/products/hooks/useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useFeature } from "@/lib/features/useFeature";
import { ProductFormModal } from "@/features/products/components/ProductFormModal";
import type { Product } from "@/features/products/types";

function stockTag(stock: number) {
  if (stock === 0) return <Tag color="red">Out of stock</Tag>;
  if (stock < 10) return <Tag color="orange">Low · {stock}</Tag>;
  return <Tag color="green">{stock}</Tag>;
}

export default function CatalogPage() {
  const { message } = App.useApp();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteProduct();
  const hasVariants = useFeature("productVariants");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [gallery, setGallery] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !categoryId || p.categoryId === categoryId;
        return matchesSearch && matchesCategory;
      }),
    [products, search, categoryId],
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Product deleted");
    } catch {
      message.error("Failed to delete product");
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Product",
      dataIndex: "name",
      render: (_, p) => (
        <Space>
          <Avatar
            shape="square"
            size={40}
            src={p.images[0]}
            style={{ cursor: p.images.length ? "pointer" : "default" }}
            onClick={() => p.images.length && setGallery(p)}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{p.name}</div>
            <span style={{ fontSize: 12, color: "var(--app-text-muted)" }}>{p.sku}</span>
          </div>
        </Space>
      ),
    },
    { title: "Category", dataIndex: "categoryName" },
    {
      title: "Price",
      dataIndex: "price",
      align: "right",
      sorter: (a, b) => a.price - b.price,
      render: (price: number, p) => {
        if (hasVariants && p.variants.length > 1) {
          const prices = p.variants.map((v) => v.price);
          return `${formatCurrency(Math.min(...prices))} – ${formatCurrency(Math.max(...prices))}`;
        }
        return formatCurrency(price);
      },
    },
    { title: "Stock", dataIndex: "stock", align: "center", render: stockTag },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (active: boolean) =>
        active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, p) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(p)} />
          <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(p.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        actions={<CreateButton onClick={openCreate}>Add product</CreateButton>}
      />
      <ContentCard
        toolbar={
          <Space wrap style={{ padding: 16 }}>
            <Input.Search
              allowClear
              placeholder="Search name or SKU"
              style={{ width: 240 }}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FilterSelect
              placeholder="All categories"
              value={categoryId}
              onChange={(v) => setCategoryId(v)}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Space>
        }
      >
        <DataTable<Product>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={filtered}
        />
      </ContentCard>
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editing}
      />

      <Modal
        open={!!gallery}
        title={gallery?.name}
        footer={null}
        width={720}
        onCancel={() => {
          setGallery(null);
          setActiveImageIndex(0);
        }}
        forceRender
      >
        {gallery && gallery.images.length > 0 && (
          <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, background: "#f5f5f5", borderRadius: 8, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gallery.images[activeImageIndex]}
                alt={`${gallery.name} ${activeImageIndex + 1}`}
                style={{ maxWidth: "100%", maxHeight: 600, objectFit: "contain" }}
              />
            </div>

            {gallery.images.length > 1 && (
              <>
                <Button
                  type="text"
                  shape="circle"
                  icon={<LeftOutlined style={{ fontSize: 20 }} />}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 16,
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.8)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? gallery.images.length - 1 : prev - 1))}
                />
                <Button
                  type="text"
                  shape="circle"
                  icon={<RightOutlined style={{ fontSize: 20 }} />}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 16,
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.8)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                  onClick={() => setActiveImageIndex((prev) => (prev === gallery.images.length - 1 ? 0 : prev + 1))}
                />
              </>
            )}

            {gallery.images.length > 1 && (
              <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 6 }}>
                {gallery.images.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: idx === activeImageIndex ? "#1677FF" : "#d9d9d9",
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
