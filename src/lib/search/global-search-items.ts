import type { ReactNode } from "react";
import { NAV_ITEMS } from "@/config/nav";
import { ROUTES } from "@/config/routes";
import type { Permission } from "@/lib/rbac/permissions";

export type GlobalSearchGroup = "navigation" | "actions" | "products";

export interface GlobalSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  group: GlobalSearchGroup;
  icon?: ReactNode;
  keywords: string[];
}

interface BuildIndexOptions {
  can: (permission: Permission) => boolean;
  navLabel: (key: string) => string;
  actionLabels: {
    addProduct: string;
    createOrder: string;
  };
}

export function buildStaticSearchIndex({
  can,
  navLabel,
  actionLabels,
}: BuildIndexOptions): GlobalSearchItem[] {
  const navigation: GlobalSearchItem[] = NAV_ITEMS.filter((item) =>
    can(item.permission),
  ).map((item) => ({
    id: `nav-${item.key}`,
    title: navLabel(item.labelKey),
    href: item.path,
    group: "navigation" as const,
    icon: item.icon,
    keywords: [item.key, item.path, navLabel(item.labelKey)],
  }));

  const actions: GlobalSearchItem[] = [];

  if (can("product:create")) {
    actions.push({
      id: "action-add-product",
      title: actionLabels.addProduct,
      href: `${ROUTES.catalog}/new`,
      group: "actions",
      keywords: ["add", "new", "product", ROUTES.catalog],
    });
  }

  if (can("order:create")) {
    actions.push({
      id: "action-create-order",
      title: actionLabels.createOrder,
      href: `${ROUTES.orders}/new`,
      group: "actions",
      keywords: ["create", "order", ROUTES.orders],
    });
  }

  return [...navigation, ...actions];
}

export function buildProductSearchItems(
  products: Array<{ id: string; name: string; sku: string }>,
): GlobalSearchItem[] {
  return products.map((p) => ({
    id: `product-${p.id}`,
    title: p.name,
    subtitle: p.sku,
    href: `${ROUTES.catalog}/${p.id}`,
    group: "products" as const,
    keywords: [p.name, p.sku, p.id],
  }));
}

export function filterSearchItems(
  items: GlobalSearchItem[],
  query: string,
  limit = 12,
): GlobalSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return items.filter((item) => item.group !== "products").slice(0, limit);
  }

  return items
    .filter((item) =>
      item.keywords.some((k) => k.toLowerCase().includes(q)) ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q),
    )
    .slice(0, limit);
}
