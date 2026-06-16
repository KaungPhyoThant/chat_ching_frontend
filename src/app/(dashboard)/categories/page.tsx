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
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ApiError } from "@/lib/api/client";
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

const TOP_LEVEL = "__top__";

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
      form.setFieldsValue({
        ...editing,
        parentId: editing.parentId ?? TOP_LEVEL,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        parentId: TOP_LEVEL,
        isActive: true,
        sortOrder: 1,
      });
    }
  }, [open, editing, form]);

  const nameById = (id: string | null) =>
    id ? (categories.find((c) => c.id === id)?.name ?? "-") : "-";

  const parentOptions = [
    { label: "- Main category -", value: TOP_LEVEL },
    ...categories
      .filter((category) => !category.parentId && category.id !== editing?.id)
      .map((category) => ({ label: category.name, value: category.id })),
  ];

  const submit = () => {
    form.validateFields().then(async (values) => {
      const payload = {
        ...values,
        parentId:
          !values.parentId || values.parentId === TOP_LEVEL
            ? null
            : values.parentId,
      };

      try {
        if (editing) {
          await updateMutation.mutateAsync({ id: editing.id, payload });
          message.success("Category updated");
        } else {
          await createMutation.mutateAsync(payload);
          message.success("Category created");
        }
        setOpen(false);
      } catch (err) {
        const error = err as ApiError;
        message.error(error.message || "Failed to save category");
      }
    });
  };

  const remove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Category deleted");
    } catch (err) {
      const error = err as ApiError;
      message.error(error.message || "Category cannot be deleted");
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value: string) => <strong>{value}</strong>,
    },
    {
      title: "Type",
      dataIndex: "parentId",
      render: (value: string | null) =>
        value ? (
          <Tag color="blue">Sub category</Tag>
        ) : (
          <Tag color="purple">Main category</Tag>
        ),
    },
    {
      title: "Parent",
      dataIndex: "parentId",
      render: (value: string | null) => nameById(value),
    },
    { title: "Slug", dataIndex: "slug" },
    { title: "Products", dataIndex: "productCount", align: "center" },
    { title: "Sub categories", dataIndex: "childrenCount", align: "center" },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (active: boolean) =>
        active ? <Tag color="green">Active</Tag> : <Tag>Hidden</Tag>,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(category);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Delete this category?"
            onConfirm={() => remove(category.id)}
          >
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
        actions={
          <CreateButton
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Add category
          </CreateButton>
        }
      />
      <ContentCard>
        <DataTable<Category>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={categories}
        />
      </ContentCard>

      <Modal
        open={open}
        title={editing ? "Edit category" : "Add category"}
        okText={editing ? "Save" : "Create"}
        onOk={submit}
        onCancel={() => setOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Category name" />
          </Form.Item>
          <Form.Item
            name="parentId"
            label="Parent category"
            tooltip="Leave as Main category for a top-level category. Pick a parent to make it a subcategory."
          >
            <Select
              allowClear
              options={parentOptions}
              placeholder="Main category"
            />
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
