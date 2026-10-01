import Admin from "../models/Admin";
import {
  AdminRole,
  permissionsForRole,
  Permission,
} from "../rbac/permissions";

export interface AdminSerializer {
  id: string;
  name: string;
  email: string;
  role: AdminRole | string;
  permissions: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const serializeAdmin = (admin: Admin): AdminSerializer => {
  const json = admin.toJSON() as any;
  const { password, ...rest } = json;
  const role = (rest.role as AdminRole) || AdminRole.ADMIN;
  return {
    ...rest,
    role,
    permissions: permissionsForRole(role),
  };
};

export const serializeAdmins = (admins: Admin[]): AdminSerializer[] => {
  return admins.map((a) => serializeAdmin(a));
};
