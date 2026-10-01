import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AdminRole } from "../rbac/permissions";

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || "cjm_admin_secret_key";

export const hashAdminPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const compareAdminPassword = async (
  enteredPassword: string,
  storedHash: string
) => {
  return await bcrypt.compare(enteredPassword, storedHash);
};

export const generateAdminToken = (
  adminId: string,
  role: AdminRole | string = AdminRole.ADMIN
) => {
  return jwt.sign({ id: adminId, role }, SECRET_KEY, { expiresIn: "8h" });
};

export const verifyAdminToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};
