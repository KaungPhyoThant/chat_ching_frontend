import {
  CRUD_COLUMNS,
  RBAC_MODULES,
  type CrudAction,
  permissionKey,
} from "@/features/rbac/rbac-modules";

/** Role codes — mirror database `roles.code`. */
export type Role =
  | "DEV"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CATALOG_MANAGER"
  | "ORDER_MANAGER"
  | "SUPPORT_AGENT";

export type Permission =
  | `${(typeof RBAC_MODULES)[number]["module"]}:${CrudAction}`
  | "user:manage"
  | "settings:manage";

export const ALL_PERMISSIONS: Permission[] = [
  ...RBAC_MODULES.flatMap((m) =>
    CRUD_COLUMNS.map((c) => permissionKey(m.module, c.action) as Permission),
  ),
  "user:manage",
  "settings:manage",
];

const LEGACY_MANAGE: Record<string, string> = {
  "settings:manage": "settings",
  "user:manage": "user",
};

/** True if the user has the exact key or equivalent CRUD / legacy manage. */
export function canAction(
  permissions: readonly string[],
  module: string,
  action: CrudAction,
): boolean {
  const key = permissionKey(module, action);
  if (permissions.includes(key)) return true;
  if (permissions.includes(`${module}:manage`)) return true;
  return false;
}

export function hasPermission(
  permissions: readonly string[],
  permission: Permission | string,
): boolean {
  if (permissions.includes(permission)) return true;

  const legacyModule = LEGACY_MANAGE[permission];
  if (legacyModule) {
    return CRUD_COLUMNS.some((c) => canAction(permissions, legacyModule, c.action));
  }

  const [module, action] = permission.split(":");
  if (!module || !action) return false;

  if (action === "manage") {
    return (
      permissions.includes(`${module}:manage`) ||
      CRUD_COLUMNS.some((c) => canAction(permissions, module, c.action))
    );
  }

  if (
    action === "read" ||
    action === "create" ||
    action === "update" ||
    action === "delete"
  ) {
    return canAction(permissions, module, action);
  }

  return false;
}

function crud(
  module: string,
  actions: CrudAction[],
): Permission[] {
  return actions.map((a) => permissionKey(module, a) as Permission);
}

/** Fallback when session permissions are not loaded (MSW / offline). */
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // DEV is the only role with capability perms (gates the Settings panel).
  DEV: ALL_PERMISSIONS.filter((p) => !p.endsWith(":manage")) as Permission[],
  SUPER_ADMIN: ALL_PERMISSIONS.filter(
    (p) => !p.endsWith(":manage") && !p.startsWith("capabilities:"),
  ) as Permission[],
  ADMIN: [
    ...crud("product", ["read", "create", "update", "delete"]),
    ...crud("order", ["read", "create", "update", "delete"]),
    ...crud("customer", ["read", "create", "update"]),
    ...crud("promotion", ["read", "create", "update", "delete"]),
    ...crud("conversation", ["read", "update"]),
    ...crud("broadcast", ["read", "create", "update"]),
    ...crud("report", ["read"]),
    ...crud("user", ["read", "create", "update"]),
    ...crud("settings", ["read", "update"]),
  ],
  CATALOG_MANAGER: [
    ...crud("product", ["read", "create", "update", "delete"]),
    ...crud("order", ["read"]),
  ],
  ORDER_MANAGER: [
    ...crud("product", ["read"]),
    ...crud("order", ["read", "create", "update"]),
    ...crud("customer", ["read"]),
    ...crud("promotion", ["read", "update"]),
    ...crud("report", ["read"]),
  ],
  SUPPORT_AGENT: [
    ...crud("conversation", ["read", "create", "update"]),
    ...crud("order", ["read"]),
    ...crud("customer", ["read"]),
  ],
};

export function isPermission(value: string): value is Permission {
  return ALL_PERMISSIONS.includes(value as Permission);
}
