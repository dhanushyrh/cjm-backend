import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

const SECRET_KEY = process.env.JWT_SECRET || "cjm_secret_key";

// Hash password before saving
export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare entered password with stored hash
export const comparePassword = async (enteredPassword: string, storedHash: string) => {
  return await bcrypt.compare(enteredPassword, storedHash);
};

// Generate JWT Token
export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: "1h" });
};

// Verify JWT Token
export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};
