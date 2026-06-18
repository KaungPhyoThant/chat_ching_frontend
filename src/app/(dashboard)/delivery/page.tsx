"use client";

import { useEffect, useState } from "react";
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateButton } from "@/components/ui/CreateButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { formatCurrency } from "@/lib/format";
import {
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
  useCities,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
  useTownships,
  useCreateTownship,
  useUpdateTownship,
  useDeleteTownship,
} from "@/features/delivery/hooks/useDelivery";
import type { City, Region, Township } from "@/features/delivery/types";

function feeCell(fee: number | null) {
  if (fee == null) return <Tag>Inherit</Tag>;
  if (fee === 0) return <Tag color="green">Free</Tag>;
  return formatCurrency(fee);
}

function statusCell(active: boolean) {
  return active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>;
}

/* ---------------- Regions ---------------- */
function RegionsTab() {
  const { message } = App.useApp();
  const { data: regions = [], isLoading } = useRegions();
  const create = useCreateRegion();
  const update = useUpdateRegion();
  const del = useDeleteRegion();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Region | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (editing) form.setFieldsValue(editing);
    else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, deliveryFee: null });
    }
  }, [open, editing, form]);

  const submit = () =>
    form.validateFields().then(async (v) => {
      try {
        if (editing) await update.mutateAsync({ id: editing.id, payload: v });
        else await create.mutateAsync(v);
        message.success("Saved");
        setOpen(false);
      } catch {
        message.error("Failed to save region");
      }
    });

  const remove = async (id: string) => {
    try {
      await del.mutateAsync(id);
      message.success("Deleted");
    } catch {
      message.error("Region has cities — delete those first");
    }
  };

  const columns: ColumnsType<Region> = [
    { title: "Region", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "Delivery fee", dataIndex: "deliveryFee", render: feeCell },
    { title: "Status", dataIndex: "isActive", render: statusCell },
    {
      title: "",
      key: "a",
      align: "right",
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(r); setOpen(true); }} />
          <Popconfirm title="Delete region?" onConfirm={() => remove(r.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <CreateButton onClick={() => { setEditing(null); setOpen(true); }}>Add region</CreateButton>
      </Space>
      <DataTable<Region> rowKey="id" loading={isLoading} columns={columns} dataSource={regions} />
      <Modal open={open} title={editing ? "Edit region" : "Add region"} okText="Save" onOk={submit} onCancel={() => setOpen(false)} confirmLoading={create.isPending || update.isPending} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="e.g. Yangon" /></Form.Item>
          <Form.Item name="deliveryFee" label="Delivery fee (Ks)" tooltip="Leave empty to set fees at city/township level instead. 0 = free.">
            <InputNumber min={0} step={500} style={{ width: "100%" }} placeholder="(inherit / unset)" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

/* ---------------- Cities ---------------- */
function CitiesTab() {
  const { message } = App.useApp();
  const { data: regions = [] } = useRegions();
  const { data: cities = [], isLoading } = useCities();
  const create = useCreateCity();
  const update = useUpdateCity();
  const del = useDeleteCity();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);
  const [form] = Form.useForm();

  const regionName = (id: string) => regions.find((r) => r.id === id)?.name ?? "—";

  useEffect(() => {
    if (!open) return;
    if (editing) form.setFieldsValue(editing);
    else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, deliveryFee: null });
    }
  }, [open, editing, form]);

  const submit = () =>
    form.validateFields().then(async (v) => {
      try {
        if (editing) await update.mutateAsync({ id: editing.id, payload: v });
        else await create.mutateAsync(v);
        message.success("Saved");
        setOpen(false);
      } catch {
        message.error("Failed to save city");
      }
    });

  const remove = async (id: string) => {
    try {
      await del.mutateAsync(id);
      message.success("Deleted");
    } catch {
      message.error("City has townships — delete those first");
    }
  };

  const columns: ColumnsType<City> = [
    { title: "City", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "Region", dataIndex: "regionId", render: regionName },
    { title: "Delivery fee", dataIndex: "deliveryFee", render: feeCell },
    { title: "Status", dataIndex: "isActive", render: statusCell },
    {
      title: "",
      key: "a",
      align: "right",
      render: (_, c) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(c); setOpen(true); }} />
          <Popconfirm title="Delete city?" onConfirm={() => remove(c.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <CreateButton onClick={() => { setEditing(null); setOpen(true); }}>Add city</CreateButton>
      </Space>
      <DataTable<City> rowKey="id" loading={isLoading} columns={columns} dataSource={cities} />
      <Modal open={open} title={editing ? "Edit city" : "Add city"} okText="Save" onOk={submit} onCancel={() => setOpen(false)} confirmLoading={create.isPending || update.isPending} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="regionId" label="Region" rules={[{ required: true }]}>
            <Select options={regions.map((r) => ({ label: r.name, value: r.id }))} placeholder="Select region" />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="e.g. Insein" /></Form.Item>
          <Form.Item name="deliveryFee" label="Delivery fee (Ks)" tooltip="Leave empty to inherit the region's fee. 0 = free.">
            <InputNumber min={0} step={500} style={{ width: "100%" }} placeholder="(inherit from region)" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

/* ---------------- Townships ---------------- */
function TownshipsTab() {
  const { message } = App.useApp();
  const { data: cities = [] } = useCities();
  const { data: townships = [], isLoading } = useTownships();
  const create = useCreateTownship();
  const update = useUpdateTownship();
  const del = useDeleteTownship();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Township | null>(null);
  const [form] = Form.useForm();

  const cityName = (id: string) => cities.find((c) => c.id === id)?.name ?? "—";

  useEffect(() => {
    if (!open) return;
    if (editing) form.setFieldsValue(editing);
    else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, deliveryFee: null });
    }
  }, [open, editing, form]);

  const submit = () =>
    form.validateFields().then(async (v) => {
      try {
        if (editing) await update.mutateAsync({ id: editing.id, payload: v });
        else await create.mutateAsync(v);
        message.success("Saved");
        setOpen(false);
      } catch {
        message.error("Failed to save township");
      }
    });

  const columns: ColumnsType<Township> = [
    { title: "Township", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "City", dataIndex: "cityId", render: cityName },
    { title: "Delivery fee", dataIndex: "deliveryFee", render: feeCell },
    { title: "Status", dataIndex: "isActive", render: statusCell },
    {
      title: "",
      key: "a",
      align: "right",
      render: (_, t) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(t); setOpen(true); }} />
          <Popconfirm title="Delete township?" onConfirm={async () => { await del.mutateAsync(t.id); message.success("Deleted"); }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <CreateButton onClick={() => { setEditing(null); setOpen(true); }}>Add township</CreateButton>
      </Space>
      <DataTable<Township> rowKey="id" loading={isLoading} columns={columns} dataSource={townships} />
      <Modal open={open} title={editing ? "Edit township" : "Add township"} okText="Save" onOk={submit} onCancel={() => setOpen(false)} confirmLoading={create.isPending || update.isPending} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="cityId" label="City" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={cities.map((c) => ({ label: c.name, value: c.id }))}
              placeholder="Select city"
            />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="e.g. Hlaing" /></Form.Item>
          <Form.Item name="deliveryFee" label="Delivery fee (Ks)" tooltip="Leave empty to inherit the city/region fee. 0 = free.">
            <InputNumber min={0} step={500} style={{ width: "100%" }} placeholder="(inherit from city/region)" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default function DeliveryPage() {
  return (
    <>
      <PageHeader
        title="Delivery areas"
        subtitle="Region → City → Township. Set the fee at any level; the most specific wins (township → city → region)."
      />
      <ContentCard>
        <Tabs
          items={[
            { key: "regions", label: "Regions", children: <RegionsTab /> },
            { key: "cities", label: "Cities", children: <CitiesTab /> },
            { key: "townships", label: "Townships", children: <TownshipsTab /> },
          ]}
        />
      </ContentCard>
    </>
  );
}
