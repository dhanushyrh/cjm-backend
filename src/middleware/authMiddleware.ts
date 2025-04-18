import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const SECRET_KEY = process.env.JWT_SECRET || "cjm_secret_key";
const ADMIN_SECRET_KEY = process.env.ADMIN_JWT_SECRET || "cjm_admin_secret_key";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied! No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    
    // Check if user is active
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: "Account is inactive. Please contact administrator." });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token!" });
  }
};

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied! No token provided." });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired admin token!" });
  }
};
