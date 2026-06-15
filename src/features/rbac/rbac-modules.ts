/** UI labels for RBAC matrix rows (mirrors backend `RBAC_MODULES`). */
export const RBAC_MODULES = [
  { module: "product", label: "Products" },
  { module: "order", label: "Orders" },
  { module: "customer", label: "Customers" },
  { module: "promotion", label: "Promotions" },
  { module: "conversation", label: "Conversations" },
  { module: "broadcast", label: "Broadcasts" },
  { module: "report", label: "Reports" },
  { module: "user", label: "Staff users" },
  { module: "settings", label: "Settings" },
] as const;

export const CRUD_COLUMNS = [
  { action: "read", label: "List" },
  { action: "create", label: "Create" },
  { action: "update", label: "Edit" },
  { action: "delete", label: "Delete" },
] as const;

export type CrudAction = (typeof CRUD_COLUMNS)[number]["action"];

export function permissionKey(module: string, action: CrudAction): string {
  return `${module}:${action}`;
}
