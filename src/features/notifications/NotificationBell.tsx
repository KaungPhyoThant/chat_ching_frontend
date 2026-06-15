"use client";

import { useMemo } from "react";
import { Badge, Button, Flex, Popover, Spin, Typography } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  InfoCircleOutlined,
  TagOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { NotificationType } from "./data";
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "./hooks/useNotifications";

dayjs.extend(relativeTime);

const { Text } = Typography;

const ICONS: Record<NotificationType, React.ReactNode> = {
  ORDER_CONFIRMED: <ShoppingCartOutlined style={{ color: "#1677ff" }} />,
  ORDER_SHIPPED: <RocketOutlined style={{ color: "#722ed1" }} />,
  ORDER_DELIVERED: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  PROMOTION: <TagOutlined style={{ color: "#fa8c16" }} />,
  HANDOFF_REQUEST: <MessageOutlined style={{ color: "#cf1322" }} />,
  SYSTEM_ALERT: <InfoCircleOutlined style={{ color: "#8c8c8c" }} />,
};

export function NotificationBell({ compact = false }: Readonly<{ compact?: boolean }>) {
  const { data: items = [], isLoading } = useNotifications();
  const markAllMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  const unread = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const markAll = () => {
    if (unread > 0) {
      markAllMutation.mutate();
    }
  };

  const handleItemClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(id);
    }
  };

  const content = (
    <div style={{ width: 320 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Text strong>Notifications</Text>
        <Button
          type="link"
          size="small"
          onClick={markAll}
          disabled={unread === 0 || markAllMutation.isPending}
        >
          Mark all read
        </Button>
      </Flex>
      <Flex vertical gap={2} style={{ maxHeight: 360, overflowY: "auto" }}>
        {isLoading ? (
          <Flex justify="center" align="center" style={{ padding: 24 }}>
            <Spin size="small" />
          </Flex>
        ) : items.length === 0 ? (
          <Flex justify="center" align="center" style={{ padding: 24 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              No notifications yet
            </Text>
          </Flex>
        ) : (
          items.map((n) => (
            <Flex
              key={n.id}
              gap={10}
              onClick={() => handleItemClick(n.id, n.isRead)}
              style={{
                padding: "8px 6px",
                borderRadius: 8,
                background: n.isRead ? "transparent" : "rgba(22,119,255,0.06)",
                cursor: n.isRead ? "default" : "pointer",
                transition: "background 0.2s ease",
              }}
            >
              <div style={{ fontSize: 16, lineHeight: "20px" }}>{ICONS[n.type]}</div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 13 }}>
                  {n.title}
                </Text>
                <div style={{ fontSize: 12, color: "#64748b" }}>{n.body}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  {dayjs(n.createdAt).fromNow()}
                </div>
              </div>
            </Flex>
          ))
        )}
      </Flex>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <span className="app-notification-bell">
        <Badge count={unread} size="small" offset={compact ? [-4, 4] : undefined}>
          <Button
            type="text"
            className={compact ? "app-topbar-icon-btn" : undefined}
            icon={<BellOutlined />}
            aria-label="Notifications"
          />
        </Badge>
      </span>
    </Popover>
  );
}
