import type { Role } from "./permissions";

const BACKEND_TO_FRONTEND_ROLE: Record<string, Role> = {
  super_admin: "SUPER_ADMIN",
  admin: "ADMIN",
  catalog_manager: "CATALOG_MANAGER",
  order_manager: "ORDER_MANAGER",
  support_agent: "SUPPORT_AGENT",
};

const FRONTEND_ROLES = new Set<Role>([
  "SUPER_ADMIN",
  "ADMIN",
  "CATALOG_MANAGER",
  "ORDER_MANAGER",
  "SUPPORT_AGENT",
]);

export function normalizeRole(role: string): Role {
  if (FRONTEND_ROLES.has(role as Role)) {
    return role as Role;
  }

  const normalized = BACKEND_TO_FRONTEND_ROLE[role.trim().toLowerCase()];
  if (!normalized) {
    throw new Error(`Unknown role code: ${role}`);
  }
  return normalized;
}

export function toBackendRole(role: Role): string {
  return role.toLowerCase();
}
