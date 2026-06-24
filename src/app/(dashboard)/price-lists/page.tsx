"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateButton } from "@/components/ui/CreateButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { formatCurrency } from "@/lib/format";
import { useProducts } from "@/features/products/hooks/useProducts";
import {
  useCreatePriceList,
  useCustomerGroups,
  usePriceLists,
  useUpdatePriceList,
} from "@/features/pricing/hooks/usePricing";
import type { CurrencyCode, PriceList, PriceListItem } from "@/features/pricing/types";

const CURRENCIES: CurrencyCode[] = ["MMK", "USD", "THB"];
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

export default function PriceListsPage() {
  const { message } = App.useApp();
  const { data: priceLists = [], isLoading } = usePriceLists();
  const { data: groups = [] } = useCustomerGroups();
  const { data: products = [] } = useProducts();
  const createMutation = useCreatePriceList();
  const updateMutation = useUpdatePriceList();

  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<PriceListItem[]>([]);

  const groupName = (id: string | null) =>
    id ? (groups.find((g) => g.id === id)?.name ?? "—") : "All customers";

  // variantId → "Product · Variant name" + flat options for the picker.
  const variantIndex = useMemo(() => {
    const map = new Map<string, string>();
    const options: { label: string; value: string }[] = [];
    for (const p of products) {
      for (const v of p.variants) {
        // Option values (e.g. "White / Small"); the editor stores raw values in
        // optionValueIds, so fall back to the token, then to the SKU.
        const valueLabel = v.optionValueIds
          .map((id) => {
            for (const ot of p.optionTypes) {
              const val = ot.values?.find((x) => x.id === id);
              if (val) return val.value;
            }
            return id;
          })
          .filter(Boolean)
          .join(" / ");
        const label = `${p.name} · ${valueLabel || v.sku}`;
        map.set(v.id, label);
        options.push({ label, value: v.id });
      }
    }
    return { map, options };
  }, [products]);

  const selected = priceLists.find((pl) => pl.id === selectedId) ?? null;

  const openDrawer = (pl: PriceList) => {
    setSelectedId(pl.id);
    setDraftItems(pl.items.map((it) => ({ ...it })));
  };

  const addItem = () => {
    const firstUnused = variantIndex.options.find(
      (o) => !draftItems.some((it) => it.variantId === o.value),
    );
    if (!firstUnused) {
      message.info("All variants already have a price in this list.");
      return;
    }
    setDraftItems((prev) => [
      ...prev,
      { id: uid("pli"), priceListId: selectedId ?? "", variantId: firstUnused.value, price: 0, tiers: [] },
    ]);
  };

  const saveItems = async () => {
    if (!selected) return;
    try {
      await updateMutation.mutateAsync({ id: selected.id, payload: { items: draftItems } });
      message.success("Price list updated");
      setSelectedId(null);
    } catch {
      message.error("Failed to save price list");
    }
  };

  const submitCreate = () => {
    form.validateFields().then(async (values) => {
      try {
        await createMutation.mutateAsync({ ...values, items: [] });
        message.success("Price list created");
        form.resetFields();
        setCreateOpen(false);
      } catch {
        message.error("Failed to create price list");
      }
    });
  };

  const columns: ColumnsType<PriceList> = [
    { title: "Name", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "Currency", dataIndex: "currency", render: (c: string) => <Tag>{c}</Tag> },
    { title: "Customer group", dataIndex: "customerGroupId", render: (g: string | null) => groupName(g) },
    { title: "Items", key: "items", render: (_, pl) => pl.items.length },
    {
      title: "Status",
      key: "status",
      render: (_, pl) => (
        <Space>
          {pl.isDefault && <Tag color="blue">Default</Tag>}
          {pl.isActive ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>}
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<PriceListItem> = [
    {
      title: "Variant",
      dataIndex: "variantId",
      render: (variantId: string, item) => (
        <Select
          showSearch
          optionFilterProp="label"
          style={{ width: 240 }}
          value={variantId}
          options={variantIndex.options}
          onChange={(v) =>
            setDraftItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, variantId: v } : x)))
          }
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      align: "right",
      render: (price: number, item) => (
        <InputNumber
          min={0}
          value={price}
          onChange={(n) =>
            setDraftItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, price: n ?? 0 } : x)))
          }
        />
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, item) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => setDraftItems((prev) => prev.filter((x) => x.id !== item.id))}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Price lists"
        subtitle="Per customer-group & currency pricing. Applied automatically by the pricing engine."
        actions={<CreateButton onClick={() => setCreateOpen(true)}>New price list</CreateButton>}
      />
      <ContentCard>
        <DataTable<PriceList>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={priceLists}
          onRow={(record) => ({ onClick: () => openDrawer(record), style: { cursor: "pointer" } })}
        />
      </ContentCard>

      <Modal
        open={createOpen}
        title="New price list"
        okText="Create"
        onOk={submitCreate}
        onCancel={() => setCreateOpen(false)}
        confirmLoading={createMutation.isPending}
        forceRender
      >
        <Form form={form} layout="vertical" initialValues={{ currency: "MMK", priority: 1, isActive: true }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Wholesale (USD)" />
          </Form.Item>
          <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
            <Select options={CURRENCIES.map((c) => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item name="customerGroupId" label="Customer group">
            <Select
              allowClear
              placeholder="All customers"
              options={groups.map((g) => ({ label: g.name, value: g.id }))}
            />
          </Form.Item>
          <Form.Item name="priority" label="Priority" tooltip="Higher wins when multiple lists match">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        size={640}
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.name} — prices` : ""}
        extra={
          <Space>
            <Button onClick={addItem}>Add item</Button>
            <Button type="primary" loading={updateMutation.isPending} onClick={saveItems}>
              Save
            </Button>
          </Space>
        }
      >
        {selected && (
          <Table<PriceListItem>
            rowKey="id"
            size="small"
            pagination={false}
            columns={itemColumns}
            dataSource={draftItems}
            locale={{ emptyText: "No item prices — variants fall back to base price." }}
            footer={() => (
              <span style={{ color: "var(--app-text-muted)" }}>
                Prices in {selected.currency} for {groupName(selected.customerGroupId)}.{" "}
                Example base: {formatCurrency(products[0]?.price ?? 0)}.
              </span>
            )}
          />
        )}
      </Drawer>
    </>
  );
}
