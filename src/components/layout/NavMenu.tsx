"use client";

import { Menu } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NAV_ITEMS, NAV_GROUP_ORDER } from "@/config/nav";
import { usePermissions } from "@/lib/rbac/usePermissions";

export function NavMenu({
  mode = "inline",
  collapsed = false,
  onNavigate,
}: {
  mode?: "inline" | "horizontal";
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tGroup = useTranslations("groups");
  const { can } = usePermissions();

  const visibleItems = NAV_ITEMS.filter((item) => can(item.permission));

  const toMenuItem = (item: (typeof NAV_ITEMS)[number]) => ({
    key: item.path,
    icon: mode === "inline" ? item.icon : undefined,
    title: tNav(item.labelKey),
    label: (
      <Link href={item.path} onClick={onNavigate}>
        {tNav(item.labelKey)}
      </Link>
    ),
  });

  const items: MenuProps["items"] =
    mode === "inline" && collapsed
      ? visibleItems.map(toMenuItem)
      : mode === "horizontal"
      ? NAV_GROUP_ORDER.map((group) => {
          const children = visibleItems
            .filter((item) => item.group === group)
            .map(toMenuItem);

          if (children.length === 0) return null;

          return {
            key: `group-${group}`,
            label: tGroup(group),
            children,
          };
        }).filter((g): g is NonNullable<typeof g> => g !== null)
      : NAV_GROUP_ORDER.map((group) => {
          const children = visibleItems
            .filter((item) => item.group === group)
            .map(toMenuItem);

          if (children.length === 0) return null;

          return {
            key: `group-${group}`,
            type: "group" as const,
            label: tGroup(group),
            children,
          };
        }).filter((g): g is NonNullable<typeof g> => g !== null);

  return (
    <Menu
      mode={mode}
      {...(mode === "inline" ? { inlineCollapsed: collapsed } : {})}
      selectedKeys={[pathname]}
      items={items}
      className={mode === "horizontal" ? "app-header-menu" : undefined}
      style={{ border: "none", background: "transparent" }}
    />
  );
}
