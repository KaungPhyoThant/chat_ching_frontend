export type StaffStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

export interface DoctorSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
}

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
  schedules?: DoctorSchedule[];
}
