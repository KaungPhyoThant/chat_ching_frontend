import { apiClient } from "@/lib/api/client";
import type { StaffUser } from "../types";

export async function getStaff(): Promise<StaffUser[]> {
  const { data } = await apiClient.get<StaffUser[]>("/users");
  return data;
}

export interface CreateStaffPayload {
  fullName: string;
  employeeId?: string;
  email: string;
  role: string;
  department?: string;
}

export interface UpdateStaffPayload {
  fullName?: string;
  employeeId?: string;
  email?: string;
  role?: string;
  department?: string;
}

export async function createUser(payload: CreateStaffPayload): Promise<StaffUser> {
  const { data } = await apiClient.post<StaffUser>("/users", payload);
  return data;
}

export async function updateUser(
  id: string,
  payload: UpdateStaffPayload,
): Promise<StaffUser> {
  const { data } = await apiClient.patch<StaffUser>(`/users/${id}`, payload);
  return data;
}

export async function updateUserStatus(
  id: string,
  status: StaffUser["status"],
): Promise<StaffUser> {
  const { data } = await apiClient.patch<StaffUser>(`/users/${id}/status`, { status });
  return data;
}

export async function deleteUser(id: string): Promise<StaffUser> {
  const { data } = await apiClient.delete<StaffUser>(`/users/${id}`);
  return data;
}
