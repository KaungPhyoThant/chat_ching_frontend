"use client";

import type { Permission } from "./permissions";
import { usePermissions } from "./usePermissions";

interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Renders children only if the current user has the permission. */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermissions();
  return <>{can(permission) ? children : fallback}</>;
}
