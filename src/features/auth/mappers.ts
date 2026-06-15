import { mapBackendRole, parsePermissions } from "@/lib/auth/roles";
import type { CurrentUser } from "@/lib/rbac/current-user";
import type { ApiUser } from "./types";

export function toCurrentUser(user: ApiUser): CurrentUser {
  const roleCode = user.roleCode ?? user.role;
  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    role: mapBackendRole(roleCode),
    roleCode,
    permissions: parsePermissions(user.permissions ?? []),
  };
}
