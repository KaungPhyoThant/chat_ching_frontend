import { apiClient } from "@/lib/api/client";
import type { RbacPermission, RbacRole } from "../types";

export async function listRbacPermissions(): Promise<RbacPermission[]> {
  const { data } = await apiClient.get<RbacPermission[]>("/rbac/permissions");
  return data;
}

export async function listRbacRoles(): Promise<RbacRole[]> {
  const { data } = await apiClient.get<RbacRole[]>("/rbac/roles");
  return data;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export async function createRbacRole(payload: CreateRolePayload): Promise<RbacRole> {
  const { data } = await apiClient.post<RbacRole>("/rbac/roles", payload);
  return data;
}

export async function updateRbacRole(
  roleId: string,
  payload: UpdateRolePayload,
): Promise<RbacRole> {
  const { data } = await apiClient.patch<RbacRole>(`/rbac/roles/${roleId}`, payload);
  return data;
}

export async function deleteRbacRole(roleId: string): Promise<{ deleted: boolean }> {
  const { data } = await apiClient.delete<{ deleted: boolean }>(`/rbac/roles/${roleId}`);
  return data;
}

export async function setRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<RbacRole> {
  const { data } = await apiClient.put<RbacRole>(`/rbac/roles/${roleId}/permissions`, {
    permissionIds,
  });
  return data;
}
