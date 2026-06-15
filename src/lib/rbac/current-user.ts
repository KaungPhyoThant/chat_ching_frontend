import type { Permission, Role } from "./permissions";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleCode: string;
  permissions: Permission[];
}
