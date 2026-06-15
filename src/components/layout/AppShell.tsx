"use client";

import { Button, Drawer, Layout, theme } from "antd";
import { ShopOutlined, MenuOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { APP } from "@/config/app";
import { ROUTES } from "@/config/routes";
import { useUIStore } from "@/store/ui-store";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NavMenu } from "./NavMenu";
import { GlobalSearchCommand } from "@/components/search/GlobalSearchCommand";

const { Header, Content } = Layout;

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery(`(max-width: ${APP.mobileBreakpoint - 1}px)`);
  const navLayout = useUIStore((s) => s.navLayout);
  const useSidebar = !isMobile && navLayout === "sidebar";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { token } = theme.useToken();
  const t = useTranslations();

  return (
    <Layout
      className="app-app-shell"
      data-nav-layout={isMobile ? "mobile" : navLayout}
    >
      {useSidebar ? <Sidebar /> : null}

      <Layout className="app-app-main">
        <Header
          className="app-app-header"
          style={{
            height: 56,
            paddingInline: isMobile ? 12 : 20,
            background: token.colorBgContainer,
            borderBlockEnd: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {isMobile ? (
            <div className="app-mobile-header">
              <Button
                type="text"
                className="app-topbar-icon-btn"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                aria-label={t("topbar.openMenu")}
              />
              <Link
                href={ROUTES.dashboard}
                className="app-app-brand app-app-brand--mobile"
                aria-label={t("common.appName")}
              >
                <div className="app-app-brand-logo" aria-hidden>
                  <ShopOutlined />
                </div>
              </Link>
              <Topbar compact />
            </div>
          ) : (
            <div className="app-app-header-inner">
              {!useSidebar ? (
                <Link href={ROUTES.dashboard} className="app-app-brand">
                  <div className="app-app-brand-logo" aria-hidden>
                    <ShopOutlined />
                  </div>
                  <span className="app-app-brand-title">{t("common.appName")}</span>
                </Link>
              ) : null}

              {!useSidebar ? (
                <nav className="app-header-nav" aria-label="Main navigation">
                  <NavMenu mode="horizontal" />
                </nav>
              ) : null}

              <Topbar showSidebarToggle={useSidebar} />
            </div>
          )}
        </Header>

        <Content
          className="app-app-content"
          style={{
            padding: isMobile ? "16px 12px 24px" : "24px 20px 32px",
            background: token.colorBgLayout,
          }}
        >
          <div className="app-dashboard-content">{children}</div>
        </Content>
      </Layout>

      <Drawer
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="default"
        title={t("common.appName")}
        styles={{ body: { padding: 0 } }}
      >
        <NavMenu mode="inline" onNavigate={() => setDrawerOpen(false)} />
      </Drawer>

      <GlobalSearchCommand />
    </Layout>
  );
}
