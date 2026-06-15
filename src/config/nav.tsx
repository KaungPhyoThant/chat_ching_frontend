import {
  DashboardOutlined,
  ShoppingOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  MessageOutlined,
  TagsOutlined,
  SoundOutlined,
  BarChartOutlined,
  UserOutlined,
  AuditOutlined,
  BellOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { ROUTES } from "./routes";
import type { Permission } from "@/lib/rbac/permissions";

export type NavGroup = "catalog" | "operations" | "admin";

export interface NavItem {
  key: string;
  /** i18n key under "nav" */
  labelKey: string;
  icon: ReactNode;
  path: string;
  group: NavGroup;
  permission: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  // Catalog
  { key: "dashboard", labelKey: "dashboard", icon: <DashboardOutlined />, path: ROUTES.dashboard, group: "catalog", permission: "report:read" },
  { key: "catalog", labelKey: "catalog", icon: <ShoppingOutlined />, path: ROUTES.catalog, group: "catalog", permission: "product:read" },
  { key: "categories", labelKey: "categories", icon: <ApartmentOutlined />, path: ROUTES.categories, group: "catalog", permission: "product:read" },
  { key: "inventory", labelKey: "inventory", icon: <DatabaseOutlined />, path: ROUTES.inventory, group: "catalog", permission: "product:update" },
  // Operations
  { key: "orders", labelKey: "orders", icon: <ShoppingCartOutlined />, path: ROUTES.orders, group: "operations", permission: "order:read" },
  { key: "customers", labelKey: "customers", icon: <TeamOutlined />, path: ROUTES.customers, group: "operations", permission: "customer:read" },
  { key: "conversations", labelKey: "conversations", icon: <MessageOutlined />, path: ROUTES.conversations, group: "operations", permission: "conversation:read" },
  { key: "promotions", labelKey: "promotions", icon: <TagsOutlined />, path: ROUTES.promotions, group: "operations", permission: "promotion:read" },
  { key: "broadcasts", labelKey: "broadcasts", icon: <SoundOutlined />, path: ROUTES.broadcasts, group: "operations", permission: "broadcast:read" },
  // Admin
  { key: "reports", labelKey: "reports", icon: <BarChartOutlined />, path: ROUTES.reports, group: "admin", permission: "report:read" },
  { key: "users", labelKey: "users", icon: <UserOutlined />, path: ROUTES.users, group: "admin", permission: "user:manage" },
  { key: "rbac", labelKey: "rbac", icon: <SafetyCertificateOutlined />, path: ROUTES.rbac, group: "admin", permission: "settings:update" },
  { key: "auditLogs", labelKey: "auditLogs", icon: <AuditOutlined />, path: ROUTES.auditLogs, group: "admin", permission: "settings:manage" },
  { key: "notifications", labelKey: "notifications", icon: <BellOutlined />, path: ROUTES.notifications, group: "admin", permission: "report:read" },
  { key: "settings", labelKey: "settings", icon: <SettingOutlined />, path: ROUTES.settings, group: "admin", permission: "settings:manage" },
];

export const NAV_GROUP_ORDER: NavGroup[] = ["catalog", "operations", "admin"];
