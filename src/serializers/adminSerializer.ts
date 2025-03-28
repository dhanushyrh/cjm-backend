import Admin  from "../models/Admin";

export interface AdminSerializer {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const serializeAdmin = (admin: Admin): AdminSerializer => {
  const { password, ...adminWithoutPassword } = admin.toJSON();
  return adminWithoutPassword;
};

export const serializeAdmins = (admins: Admin[]): AdminSerializer[] => {
  return admins.map(admin => serializeAdmin(admin));
}; 