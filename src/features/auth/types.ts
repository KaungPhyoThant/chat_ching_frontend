/** User payload from BFF auth routes (JWT is not returned to the client). */
export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  /** CASL / legacy enum value */
  role: string;
  /** Database role code (`DOCTOR`, `SUPER_ADMIN`, …) */
  roleCode: string;
  /** Permission keys for UI gating (`patient:read`, …) */
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: ApiUser;
}

export interface MeResponse {
  user: ApiUser;
}
