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
  Tag,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateButton } from "@/components/ui/CreateButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  useCreatePromotion,
  useDeletePromotion,
  usePromotions,
  useUpdatePromotion,
} from "@/features/promotions/hooks/usePromotions";
import type { Promotion } from "@/features/promotions/types";

export default function PromotionsPage() {
  const { message } = App.useApp();
  const { data: promotions = [], isLoading } = usePromotions();
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const deleteMutation = useDeletePromotion();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (editing) form.setFieldsValue(editing);
    else { form.resetFields(); form.setFieldsValue({ type: "PERCENT", isActive: true, value: 10 }); }
  }, [open, editing, form]);

  const submit = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editing) {
          await updateMutation.mutateAsync({ id: editing.id, payload: values });
          message.success("Promotion updated");
        } else {
          await createMutation.mutateAsync(values);
          message.success("Promotion created");
        }
        setOpen(false);
      } catch {
        message.error("Failed to save promotion");
      }
    });
  };

  const remove = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    message.success("Promotion deleted");
  };

  const columns: ColumnsType<Promotion> = [
    { title: "Code", dataIndex: "code", render: (v: string) => <Tag color="geekblue">{v}</Tag> },
    {
      title: "Discount",
      key: "value",
      render: (_, p) => (p.type === "PERCENT" ? `${p.value}%` : formatCurrency(p.value)),
    },
    { title: "Min spend", dataIndex: "minSpend", render: (v?: number) => (v ? formatCurrency(v) : "—") },
    {
      title: "Usage",
      key: "usage",
      render: (_, p) => `${p.usedCount}${p.maxUses ? ` / ${p.maxUses}` : ""}`,
    },
    { title: "Expires", dataIndex: "expiresAt", render: (v?: string) => formatDate(v) },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (a: boolean) => (a ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, p) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(p); setOpen(true); }} />
          <Popconfirm title="Delete this promotion?" onConfirm={() => remove(p.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Promotions"
        subtitle="Discount codes and campaigns"
        actions={<CreateButton onClick={() => { setEditing(null); setOpen(true); }}>Add promotion</CreateButton>}
      />
      <ContentCard>
        <DataTable<Promotion> rowKey="id" loading={isLoading} columns={columns} dataSource={promotions} />
      </ContentCard>

      <Modal
        open={open}
        title={editing ? "Edit promotion" : "Add promotion"}
        okText={editing ? "Save" : "Create"}
        onOk={submit}
        onCancel={() => setOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input placeholder="SAVE10" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Percentage (%)", value: "PERCENT" },
                { label: "Fixed amount (Ks)", value: "FIXED" },
              ]}
            />
          </Form.Item>
          <Form.Item name="value" label="Value" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="minSpend" label="Minimum spend (Ks)">
            <InputNumber min={0} step={1000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="maxUses" label="Max uses">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
