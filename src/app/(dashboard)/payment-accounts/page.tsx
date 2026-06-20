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
  Upload,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateButton } from "@/components/ui/CreateButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import {
  usePaymentAccounts,
  useCreatePaymentAccount,
  useUpdatePaymentAccount,
  useDeletePaymentAccount,
} from "@/features/payments/hooks/usePaymentAccounts";
import { PAYMENT_METHODS } from "@/features/payments/types";
import type { PaymentAccount } from "@/features/payments/types";

const METHOD_LABEL = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m.label]),
);

export default function PaymentAccountsPage() {
  const { message } = App.useApp();
  const { data: accounts = [], isLoading } = usePaymentAccounts();
  const create = useCreatePaymentAccount();
  const update = useUpdatePaymentAccount();
  const del = useDeletePaymentAccount();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentAccount | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue(editing);
    } else {
      form.resetFields();
      form.setFieldsValue({ method: "KBZPAY", isActive: true, sortOrder: 0 });
    }
  }, [open, editing, form]);

  const openCreate = () => {
    setEditing(null);
    setQr(null);
    setOpen(true);
  };
  const openEdit = (a: PaymentAccount) => {
    setEditing(a);
    setQr(a.qrImage ?? null);
    setOpen(true);
  };

  const submit = () =>
    form.validateFields().then(async (v) => {
      const payload = { ...v, qrImage: qr };
      try {
        if (editing) await update.mutateAsync({ id: editing.id, payload });
        else await create.mutateAsync(payload);
        message.success("Saved");
        setOpen(false);
      } catch {
        message.error("Failed to save payment account");
      }
    });

  const remove = async (id: string) => {
    try {
      await del.mutateAsync(id);
      message.success("Deleted");
    } catch {
      message.error("Failed to delete");
    }
  };

  const columns: ColumnsType<PaymentAccount> = [
    { title: "Name", dataIndex: "name", render: (v: string) => <strong>{v}</strong> },
    {
      title: "Method",
      dataIndex: "method",
      render: (m: string) => <Tag color="blue">{METHOD_LABEL[m] ?? m}</Tag>,
    },
    {
      title: "Number",
      key: "number",
      render: (_, a) => a.phone || a.accountNumber || "—",
    },
    { title: "Bank", dataIndex: "bankName", render: (v?: string) => v || "—" },
    {
      title: "QR",
      dataIndex: "qrImage",
      render: (v?: string) =>
        v ? <Tag color="green">Yes</Tag> : <Tag>—</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (v: boolean) =>
        v ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: "",
      key: "a",
      align: "right",
      render: (_, a) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(a)} />
          <Popconfirm title="Delete account?" onConfirm={() => remove(a.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Payment accounts"
        subtitle="Accounts shown to customers at checkout (per method). The active one is used by the bot."
        actions={
          <CreateButton onClick={openCreate}>New account</CreateButton>
        }
      />
      <ContentCard>
        <DataTable<PaymentAccount>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={accounts}
        />
      </ContentCard>

      <Modal
        open={open}
        title={editing ? "Edit payment account" : "New payment account"}
        okText="Save"
        onOk={submit}
        onCancel={() => setOpen(false)}
        confirmLoading={create.isPending || update.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="method" label="Method" rules={[{ required: true }]}>
            <Select options={PAYMENT_METHODS} />
          </Form.Item>
          <Form.Item name="name" label="Account name" rules={[{ required: true }]}>
            <Input placeholder="e.g. AI Shop / U Aung" />
          </Form.Item>
          <Form.Item name="phone" label="Phone / wallet number">
            <Input placeholder="09 123 456 789" />
          </Form.Item>
          <Form.Item name="accountNumber" label="Bank account number">
            <Input placeholder="(bank transfer only)" />
          </Form.Item>
          <Form.Item name="bankName" label="Bank name">
            <Input placeholder="(bank transfer only)" />
          </Form.Item>
          <Form.Item label="QR code image">
            <Upload
              listType="picture-card"
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = () => setQr(reader.result as string);
                reader.readAsDataURL(file);
                return false;
              }}
            >
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="QR" style={{ width: "100%" }} />
              ) : (
                <div>+ Upload</div>
              )}
            </Upload>
            {qr && (
              <Button type="link" danger onClick={() => setQr(null)}>
                Remove QR
              </Button>
            )}
          </Form.Item>
          <Form.Item name="description" label="Instructions / note">
            <Input.TextArea rows={2} placeholder="e.g. Add your order number in the transfer note" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort order">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
}
