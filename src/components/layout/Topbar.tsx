"use client";

import { Avatar, Button, Dropdown, Flex, Typography } from "antd";
import {
  BulbOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { useUIStore } from "@/store/ui-store";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { usePermissions } from "@/lib/rbac/usePermissions";
import { LOCALE_LABELS } from "@/i18n/config";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { GlobalSearchTrigger } from "@/components/search/GlobalSearchTrigger";

const { Text } = Typography;

export function Topbar({
  showSidebarToggle = false,
  compact = false,
}: {
  showSidebarToggle?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations();
  const locale = useUIStore((s) => s.locale);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleLocale = useUIStore((s) => s.toggleLocale);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const { user } = usePermissions();
  const logout = useLogout();

  return (
    <Flex
      align="center"
      gap={compact ? 0 : 16}
      className={compact ? "app-topbar app-topbar--compact" : "app-topbar"}
      style={{ flexShrink: 0 }}
    >
      {showSidebarToggle ? (
        <Button
          type="text"
          className="app-topbar-icon-btn app-sidebar-toggle"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          aria-label={t("topbar.toggleSidebar")}
        />
      ) : null}

      {!compact ? (
        <div className="app-global-search">
          <GlobalSearchTrigger />
        </div>
      ) : null}

      <div className="app-topbar-actions">
        {compact ? <GlobalSearchTrigger compact /> : null}

        <Button
          type="text"
          className={compact ? "app-topbar-icon-btn" : undefined}
          icon={<GlobalOutlined />}
          onClick={toggleLocale}
          aria-label="Toggle language"
        >
          {compact ? null : LOCALE_LABELS[locale]}
        </Button>

        <Button
          type="text"
          className="app-topbar-icon-btn"
          icon={<BulbOutlined />}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        />

        <NotificationBell compact={compact} />

        <Dropdown
          menu={{
            onClick: ({ key }) => {
              if (key === "logout") logout();
            },
            items: [
              {
                key: "user",
                disabled: true,
                label: (
                  <div style={{ lineHeight: 1.3 }}>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {user.role}
                    </Text>
                  </div>
                ),
              },
              { type: "divider" },
              {
                key: "profile",
                icon: <UserOutlined />,
                label: t("topbar.profile"),
              },
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: t("topbar.logout"),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Avatar
            style={{
              background: "linear-gradient(135deg, #1677ff 0%, #4096ff 100%)",
              cursor: "pointer",
            }}
            size={compact ? "small" : "default"}
          >
            {user.name.charAt(0)}
          </Avatar>
        </Dropdown>
      </div>
    </Flex>
  );
}
