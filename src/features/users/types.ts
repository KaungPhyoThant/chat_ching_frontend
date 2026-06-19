export type StaffStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

export interface StaffUser {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  phone?: string | null;
  role: string;
  department?: string | null;
  status: StaffStatus;
  createdAt?: string;
  updatedAt?: string;
}
