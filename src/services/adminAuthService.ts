import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || "cjm_admin_secret_key";

// Hash password before saving
export const hashAdminPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare entered password with stored hash
export const compareAdminPassword = async (enteredPassword: string, storedHash: string) => {
  return await bcrypt.compare(enteredPassword, storedHash);
};

// Generate JWT Token for Admin
export const generateAdminToken = (adminId: string) => {
  return jwt.sign({ id: adminId, role: "admin" }, SECRET_KEY, { expiresIn: "1h" });
};

// Verify Admin JWT Token
export const verifyAdminToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};
