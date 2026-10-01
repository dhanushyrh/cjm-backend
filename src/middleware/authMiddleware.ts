import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Admin from "../models/Admin";
import {
  AdminRole,
  Permission,
  hasAllPermissions,
  permissionsForRole,
} from "../rbac/permissions";

const SECRET_KEY = process.env.JWT_SECRET || "cjm_secret_key";
const ADMIN_SECRET_KEY = process.env.ADMIN_JWT_SECRET || "cjm_admin_secret_key";

export interface AuthRequest extends Request {
  user?: any;
  admin?: {
    id: string;
    role: AdminRole | string;
    email: string;
    name: string;
  };
}

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    role: AdminRole | string;
    email: string;
    name: string;
  };
  user?: any;
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied! No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ error: "Account is inactive. Please contact administrator." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token!" });
  }
};

export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied! No token provided." });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_SECRET_KEY) as { id: string; role?: string };
    const admin = await Admin.findByPk(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: "Admin account not found!" });
    }

    const payload = {
      id: admin.id,
      role: admin.role || AdminRole.ADMIN,
      email: admin.email,
      name: admin.name,
    };

    req.admin = payload;
    // Backward compatible: many controllers read req.user.id for the acting admin
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired admin token!" });
  }
};

export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.admin?.role || req.user?.role;

    if (!role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasAllPermissions(role, permissions)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to perform this action",
        required: permissions,
      });
    }

    next();
  };
};

export const requireAdminRole = (...roles: AdminRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = (req.admin?.role || req.user?.role) as AdminRole | undefined;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient role for this action",
      });
    }

    next();
  };
};

export const getActingAdminId = (req: AuthRequest | AdminRequest): string | undefined => {
  return req.admin?.id || req.user?.id;
};

export const getActingAdminPermissions = (req: AuthRequest): Permission[] => {
  return permissionsForRole(req.admin?.role || req.user?.role);
};
