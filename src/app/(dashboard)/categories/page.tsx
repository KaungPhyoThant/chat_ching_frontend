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
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/features/categories/hooks/useCategories";
import type { Category } from "@/features/categories/types";

export default function CategoriesPage() {
  const { message } = App.useApp();
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue(editing);
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, sortOrder: 1 });
    }
  }, [open, editing, form]);

  const nameById = (id: string | null) =>
    id ? (categories.find((c) => c.id === id)?.name ?? "—") : "—";

  const parentOptions = categories
    .filter((c) => !c.parentId && c.id !== editing?.id)
    .map((c) => ({ label: c.name, value: c.id }));

  const submit = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editing) {
          await updateMutation.mutateAsync({ id: editing.id, payload: values });
          message.success("Category updated");
        } else {
          await createMutation.mutateAsync(values);
          message.success("Category created");
        }
        setOpen(false);
      } catch {
        message.error("Failed to save category");
      }
    });
  };

  const remove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Category deleted");
    } catch {
      message.error("Category has products and cannot be deleted");
    }
  };

  const columns: ColumnsType<Category> = [
    { title: "Name", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "Parent", dataIndex: "parentId", render: (v: string | null) => nameById(v) },
    { title: "Slug", dataIndex: "slug" },
    { title: "Products", dataIndex: "productCount", align: "center" },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (a: boolean) => (a ? <Tag color="green">Active</Tag> : <Tag>Hidden</Tag>),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, c) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(c); setOpen(true); }} />
          <Popconfirm title="Delete this category?" onConfirm={() => remove(c.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organize products into a category tree"
        actions={<CreateButton onClick={() => { setEditing(null); setOpen(true); }}>Add category</CreateButton>}
      />
      <ContentCard>
        <DataTable<Category> rowKey="id" loading={isLoading} columns={columns} dataSource={categories} />
      </ContentCard>

      <Modal
        open={open}
        title={editing ? "Edit category" : "Add category"}
        okText={editing ? "Save" : "Create"}
        onOk={submit}
        onCancel={() => setOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Category name" />
          </Form.Item>
          <Form.Item name="parentId" label="Parent category">
            <Select allowClear options={parentOptions} placeholder="Top-level" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sort order">
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
