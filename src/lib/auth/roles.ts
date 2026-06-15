import type { Permission, Role } from "@/lib/rbac/permissions";
import { isPermission } from "@/lib/rbac/permissions";

const CODE_TO_FRONTEND: Record<string, Role> = {
  DEV: "DEV",
  dev: "DEV",
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CATALOG_MANAGER: "CATALOG_MANAGER",
  ORDER_MANAGER: "ORDER_MANAGER",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  super_admin: "SUPER_ADMIN",
  admin: "ADMIN",
  catalog_manager: "CATALOG_MANAGER",
  order_manager: "ORDER_MANAGER",
  support_agent: "SUPPORT_AGENT",
};

export function mapBackendRole(roleOrCode: string): Role {
  return CODE_TO_FRONTEND[roleOrCode] ?? "SUPPORT_AGENT";
}

export function parsePermissions(keys: string[]): Permission[] {
  return keys.filter(isPermission);
}
