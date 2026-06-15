"use client";

import { useState } from "react";
import { Button, Flex, Tag, Typography } from "antd";
import {
  ShoppingCartOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  TagOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentCard } from "@/components/ui/ContentCard";
import { MOCK_NOTIFICATIONS, type NotificationType } from "@/features/notifications/data";

const { Text } = Typography;

const ICONS: Record<NotificationType, React.ReactNode> = {
  ORDER_CONFIRMED: <ShoppingCartOutlined style={{ color: "#1677ff" }} />,
  ORDER_SHIPPED: <RocketOutlined style={{ color: "#722ed1" }} />,
  ORDER_DELIVERED: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  PROMOTION: <TagOutlined style={{ color: "#fa8c16" }} />,
  HANDOFF_REQUEST: <MessageOutlined style={{ color: "#cf1322" }} />,
  SYSTEM_ALERT: <InfoCircleOutlined style={{ color: "#8c8c8c" }} />,
};

export default function NotificationsPage() {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread`}
        actions={
          <Button
            onClick={() => setItems((p) => p.map((n) => ({ ...n, isRead: true })))}
            disabled={unread === 0}
          >
            Mark all read
          </Button>
        }
      />
      <ContentCard>
        <Flex vertical>
          {items.map((n) => (
            <Flex
              key={n.id}
              gap={12}
              align="flex-start"
              style={{
                padding: "12px 8px",
                borderBottom: "1px solid var(--app-border, #f0f0f0)",
                background: n.isRead ? "transparent" : "rgba(22,119,255,0.05)",
              }}
            >
              <div style={{ fontSize: 18 }}>{ICONS[n.type]}</div>
              <div style={{ flex: 1 }}>
                <Flex justify="space-between">
                  <Text strong>{n.title}</Text>
                  {!n.isRead ? <Tag color="blue">New</Tag> : null}
                </Flex>
                <div style={{ color: "var(--app-text-muted, #64748b)" }}>{n.body}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{n.createdAt}</div>
              </div>
            </Flex>
          ))}
        </Flex>
      </ContentCard>
    </>
  );
}
