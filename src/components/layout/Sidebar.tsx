"use client";

import { Layout, theme } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { useUIStore } from "@/store/ui-store";
import { APP } from "@/config/app";
import { NavMenu } from "./NavMenu";

const { Sider } = Layout;

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const themeMode = useUIStore((s) => s.theme);
  const t = useTranslations();
  const { token } = theme.useToken();

  return (
    <Sider
      className="app-sidebar"
      theme={themeMode === "dark" ? "dark" : "light"}
      collapsed={collapsed}
      trigger={null}
      width={APP.sidebarWidth}
      collapsedWidth={APP.sidebarCollapsedWidth}
      style={{
        background: token.colorBgContainer,
        borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="app-sidebar-inner">
        <div className="app-sidebar-brand">
          <div className="app-sidebar-logo" aria-hidden>
            <ShopOutlined />
          </div>
          {!collapsed ? (
            <span className="app-sidebar-title">{t("common.appName")}</span>
          ) : null}
        </div>
        <div className="app-sidebar-nav">
          <NavMenu mode="inline" collapsed={collapsed} />
        </div>
      </div>
    </Sider>
  );
}
