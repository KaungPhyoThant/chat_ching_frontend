"use client";

import { useEffect, useState } from "react";
import { App, Button, Form, Input, Modal, Popconfirm, Space, Switch, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateButton } from "@/components/ui/CreateButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import {
  useCustomerGroups,
  useCreateCustomerGroup,
  useUpdateCustomerGroup,
  useDeleteCustomerGroup,
} from "@/features/pricing/hooks/usePricing";
import type { CustomerGroup } from "@/features/pricing/types";

export default function CustomerGroupsPage() {
  const { message } = App.useApp();
  const { data: groups = [], isLoading } = useCustomerGroups();
  const create = useCreateCustomerGroup();
  const update = useUpdateCustomerGroup();
  const del = useDeleteCustomerGroup();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerGroup | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (editing) form.setFieldsValue(editing);
    else {
      form.resetFields();
      form.setFieldsValue({ isDefault: false, isActive: true });
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
        message.error("Failed to save customer group");
      }
    });

  const remove = async (id: string) => {
    try {
      await del.mutateAsync(id);
      message.success("Deleted");
    } catch {
      message.error("Failed to delete customer group");
    }
  };

  const columns: ColumnsType<CustomerGroup> = [
    { title: "Name", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    { title: "Code", dataIndex: "code", render: (v: string) => <Tag>{v}</Tag> },
    {
      title: "Default",
      dataIndex: "isDefault",
      render: (v: boolean) => (v ? <Tag color="blue">Default</Tag> : null),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (v: boolean) => (v ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>),
    },
    {
      title: "",
      key: "a",
      align: "right",
      render: (_, g) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(g);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Delete group? Customers in it will be unassigned."
            onConfirm={() => remove(g.id)}
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
        title="Customer groups"
        subtitle="Segment customers (Retail / Wholesale / VIP …) for group-based pricing."
        actions={
          <CreateButton
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            New group
          </CreateButton>
        }
      />
      <ContentCard>
        <DataTable<CustomerGroup>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={groups}
        />
      </ContentCard>

      <Modal
        open={open}
        title={editing ? "Edit group" : "New group"}
        okText="Save"
        onOk={submit}
        onCancel={() => setOpen(false)}
        confirmLoading={create.isPending || update.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Wholesale" />
          </Form.Item>
          <Form.Item
            name="isDefault"
            label="Default group"
            valuePropName="checked"
            tooltip="New customers fall into the default group. Only one can be default."
          >
            <Switch />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
