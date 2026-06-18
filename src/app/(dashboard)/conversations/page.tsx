"use client";

import { useMemo, useState } from "react";
import { App, Button, Drawer, Flex, Input, Segmented, Space, Tag } from "antd";
import { RobotOutlined, UserOutlined, CustomerServiceOutlined, SendOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentCard } from "@/components/ui/ContentCard";
import { DataTable } from "@/components/common/DataTable";
import { fromNow, formatDateTime } from "@/lib/format";
import {
  useConversations,
  useReplyConversation,
  useSetHandoff,
} from "@/features/conversations/hooks/useConversations";
import type { Conversation, ConversationMessageRole } from "@/features/conversations/types";

const ROLE_ICON: Record<ConversationMessageRole, React.ReactNode> = {
  customer: <UserOutlined />,
  bot: <RobotOutlined />,
  agent: <CustomerServiceOutlined />,
};

export default function ConversationsPage() {
  const { message } = App.useApp();
  const { data: conversations = [], isLoading } = useConversations();
  const handoffMutation = useSetHandoff();
  const replyMutation = useReplyConversation();

  const [filter, setFilter] = useState<"all" | "handoff">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const rows = useMemo(
    () => (filter === "handoff" ? conversations.filter((c) => c.needsHandoff) : conversations),
    [conversations, filter],
  );
  const current = conversations.find((c) => c.id === selectedId) ?? null;

  const toggleHandoff = async (c: Conversation) => {
    try {
      await handoffMutation.mutateAsync({ id: c.id, needsHandoff: !c.needsHandoff });
      message.success(c.needsHandoff ? "Returned to bot" : "Escalated to agent");
    } catch {
      message.error("Failed to update conversation");
    }
  };

  const sendReply = async () => {
    if (!current || !replyText.trim()) return;
    try {
      await replyMutation.mutateAsync({ id: current.id, text: replyText.trim() });
      setReplyText("");
    } catch {
      message.error("Failed to send reply");
    }
  };

  const columns: ColumnsType<Conversation> = [
    { title: "Customer", dataIndex: "customerName", render: (v: string) => <strong>{v}</strong> },
    { title: "Intent", dataIndex: "intent", render: (v: string) => <Tag>{v}</Tag> },
    {
      title: "Mode",
      dataIndex: "needsHandoff",
      render: (h: boolean) => (h ? <Tag color="red">Needs agent</Tag> : <Tag color="blue">Bot</Tag>),
    },
    { title: "Last message", dataIndex: "lastMessageAt", render: (v: string) => fromNow(v) },
  ];

  return (
    <>
      <PageHeader title="Conversations" subtitle="AI assistant chats and human handoffs" />
      <ContentCard
        toolbar={
          <Space style={{ padding: 16 }}>
            <Segmented
              value={filter}
              onChange={(v) => setFilter(v as "all" | "handoff")}
              options={[
                { label: "All", value: "all" },
                { label: "Needs agent", value: "handoff" },
              ]}
            />
          </Space>
        }
      >
        <DataTable<Conversation>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={rows}
          onRow={(record) => ({ onClick: () => setSelectedId(record.id), style: { cursor: "pointer" } })}
        />
      </ContentCard>

      <Drawer
        size={520}
        open={!!current}
        onClose={() => setSelectedId(null)}
        title={current ? `${current.customerName} · ${current.intent}` : ""}
        extra={
          current && (
            <Button
              danger={!current.needsHandoff}
              onClick={() => toggleHandoff(current)}
              loading={handoffMutation.isPending}
            >
              {current.needsHandoff ? "Return to bot" : "Escalate to agent"}
            </Button>
          )
        }
      >
        {current && (
          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            {current.messages.map((m) => (
              <Flex
                key={m.id}
                gap={8}
                justify={m.role === "customer" ? "flex-start" : "flex-end"}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "8px 12px",
                    borderRadius: 10,
                    background:
                      m.role === "customer"
                        ? "var(--app-surface-muted, #f5f5f5)"
                        : "var(--app-primary-bg, #e6f4ff)",
                  }}
                >
                  <Flex gap={6} align="center" style={{ fontSize: 12, color: "var(--app-text-muted)", marginBottom: 2 }}>
                    {ROLE_ICON[m.role]} <span>{m.role}</span> · <span>{formatDateTime(m.at)}</span>
                  </Flex>
                  <div>{m.text}</div>
                </div>
              </Flex>
            ))}

            {current.needsHandoff ? (
              <Space.Compact style={{ width: "100%", marginTop: 8 }}>
                <Input
                  placeholder="Type a reply to the customer…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onPressEnter={sendReply}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={replyMutation.isPending}
                  onClick={sendReply}
                >
                  Send
                </Button>
              </Space.Compact>
            ) : (
              <Tag color="blue" style={{ marginTop: 8 }}>
                Bot is handling — escalate to reply as an agent
              </Tag>
            )}
          </Space>
        )}
      </Drawer>
    </>
  );
}
