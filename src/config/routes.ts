/** Typed route path constants — avoid hardcoded strings across the app. */
export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  catalog: "/catalog",
  categories: "/categories",
  inventory: "/inventory",
  orders: "/orders",
  customers: "/customers",
  promotions: "/promotions",
  conversations: "/conversations",
  broadcasts: "/broadcasts",
  reports: "/reports",
  rbac: "/rbac",
  users: "/users",
  auditLogs: "/audit-logs",
  notifications: "/notifications",
  settings: "/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
