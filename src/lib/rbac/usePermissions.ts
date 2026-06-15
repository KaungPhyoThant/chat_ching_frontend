"use client";

import type { CrudAction } from "@/features/rbac/rbac-modules";
import {
  canAction,
  DEFAULT_ROLE_PERMISSIONS,
  hasPermission,
  type Permission,
} from "./permissions";
import { MOCK_USER } from "./mock-user";
import { useAuthStore } from "@/store/auth-store";

/**
 * Permission checks for the current user (from `/auth/me` permissions, with fallback).
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user) ?? MOCK_USER;
  const permissions =
    user.permissions.length > 0
      ? user.permissions
      : DEFAULT_ROLE_PERMISSIONS[user.role];

  return {
    role: user.role,
    roleCode: user.roleCode,
    user,
    permissions,
    can: (permission: Permission | string) =>
      hasPermission(permissions, permission),
    canAction: (module: string, action: CrudAction) =>
      canAction(permissions, module, action),
  };
}
