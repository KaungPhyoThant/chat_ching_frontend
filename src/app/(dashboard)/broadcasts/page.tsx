"use client";

import { useState } from "react";
import { App, Button, Form, Input, Modal, Popconfirm, Tag } from "antd";
import { SendOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateButton } from "@/components/ui/CreateButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { formatDate } from "@/lib/format";
import {
  useBroadcasts,
  useCreateBroadcast,
  useSendBroadcast,
} from "@/features/broadcasts/hooks/useBroadcasts";
import type { Broadcast, BroadcastStatus } from "@/features/broadcasts/types";

const STATUS_COLOR: Record<BroadcastStatus, string> = {
  DRAFT: "default",
  SCHEDULED: "blue",
  SENT: "green",
};

export default function BroadcastsPage() {
  const { message } = App.useApp();
  const { data: broadcasts = [], isLoading } = useBroadcasts();
  const createMutation = useCreateBroadcast();
  const sendMutation = useSendBroadcast();

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const submit = () => {
    form.validateFields().then(async (values) => {
      try {
        await createMutation.mutateAsync(values);
        message.success("Broadcast saved as draft");
        form.resetFields();
        setOpen(false);
      } catch {
        message.error("Failed to save broadcast");
      }
    });
  };

  const send = async (b: Broadcast) => {
    try {
      const result = await sendMutation.mutateAsync(b.id);
      message.success(`"${b.title}" sent to ${result.recipientCount} customer(s)`);
    } catch {
      message.error("Failed to send broadcast");
    }
  };

  const columns: ColumnsType<Broadcast> = [
    { title: "Title", dataIndex: "title", render: (v: string) => <strong>{v}</strong> },
    { title: "Segment", dataIndex: "segment" },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: BroadcastStatus) => <Tag color={STATUS_COLOR[s]}>{s}</Tag>,
    },
    { title: "Recipients", dataIndex: "recipientCount", align: "center" },
    { title: "Sent", dataIndex: "sentAt", render: (v?: string) => formatDate(v) },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, b) =>
        b.status !== "SENT" ? (
          <Popconfirm title={`Send "${b.title}" now?`} onConfirm={() => send(b)}>
            <Button type="link" icon={<SendOutlined />} loading={sendMutation.isPending}>
              Send
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Broadcasts"
        subtitle="Push announcements to customers on Telegram"
        actions={<CreateButton onClick={() => setOpen(true)}>New broadcast</CreateButton>}
      />
      <ContentCard>
        <DataTable<Broadcast> rowKey="id" loading={isLoading} columns={columns} dataSource={broadcasts} />
      </ContentCard>

      <Modal
        open={open}
        title="New broadcast"
        okText="Save draft"
        onOk={submit}
        onCancel={() => setOpen(false)}
        confirmLoading={createMutation.isPending}
        forceRender
      >
        <Form form={form} layout="vertical" initialValues={{ segment: "All customers" }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Weekend Flash Sale" />
          </Form.Item>
          <Form.Item name="segment" label="Segment" rules={[{ required: true }]}>
            <Input placeholder="All customers" />
          </Form.Item>
          <Form.Item name="body" label="Message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Write your announcement…" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
