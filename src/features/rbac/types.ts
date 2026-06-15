export interface RbacPermission {
  id: string;
  key: string;
  module: string;
  action: string;
  resource: string;
}

export interface RbacRole {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  userCount: number;
  permissions: RbacPermission[];
}
