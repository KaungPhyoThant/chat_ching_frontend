import type { StaffUser } from "@/features/users/types";

export const MOCK_STAFF: StaffUser[] = [
  { id: "1", fullName: "System Administrator", employeeId: "EMP-0000001", email: "admin@example.com", role: "SUPER_ADMIN", department: "Operations", status: "ACTIVE" },
  { id: "2", fullName: "Catalog Manager", employeeId: "EMP-CAT001", email: "catalog@example.com", role: "CATALOG_MANAGER", department: "Catalog", status: "ACTIVE" },
  { id: "3", fullName: "Order Manager", employeeId: "EMP-ORD001", email: "orders@example.com", role: "ORDER_MANAGER", department: "Fulfillment", status: "ACTIVE" },
  { id: "4", fullName: "Support Agent", employeeId: "EMP-SUP001", email: "support@example.com", role: "SUPPORT_AGENT", department: "Customer Support", status: "ACTIVE" },
];
