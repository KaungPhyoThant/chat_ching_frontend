"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRbacRole,
  deleteRbacRole,
  listRbacPermissions,
  listRbacRoles,
  setRolePermissions,
  updateRbacRole,
  type CreateRolePayload,
  type UpdateRolePayload,
} from "../api/rbac-api";
import { authQueryKeys } from "@/features/auth/hooks/useCurrentUser";

export const rbacQueryKeys = {
  permissions: ["rbac", "permissions"] as const,
  roles: ["rbac", "roles"] as const,
};

export function useRbacPermissions() {
  return useQuery({
    queryKey: rbacQueryKeys.permissions,
    queryFn: listRbacPermissions,
    staleTime: 60_000,
  });
}

export function useRbacRoles() {
  return useQuery({
    queryKey: rbacQueryKeys.roles,
    queryFn: listRbacRoles,
    staleTime: 30_000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRbacRole(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rbacQueryKeys.roles });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: UpdateRolePayload }) =>
      updateRbacRole(roleId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rbacQueryKeys.roles });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => deleteRbacRole(roleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rbacQueryKeys.roles });
    },
  });
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => setRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rbacQueryKeys.roles });
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
    },
  });
}
