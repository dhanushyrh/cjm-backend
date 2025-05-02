import { Request, Response } from "express";
import User from "../models/User";
import { comparePassword, generateToken } from "../services/authService";
import { serializeUser } from "../serializers/userSerializer";
import { hashPassword } from "../services/authService";

// Login user and return JWT token
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined
        }
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id);
    const serializedUser = serializeUser(user);

    res.json({ 
      message: "Login successful", 
      token,
      user: serializedUser
    });
  } catch (error: any) {
    console.error("User Login Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
    }

    res.status(500).json({ error: "Failed to login" });
  }
};

// Change user password
export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Get authenticated user ID from token
    const { oldPassword, newPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          oldPassword: !oldPassword ? "Old password is required" : undefined,
          newPassword: !newPassword ? "New password is required" : undefined
        }
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: "Password validation failed",
        details: "Password must be at least 8 characters long"
      });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify old password
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    res.json({ 
      success: true,
      message: "Password changed successfully"
    });
  } catch (error: any) {
    console.error("Change Password Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
    }

    res.status(500).json({ 
      success: false,
      error: "Failed to change password" 
    });
  }
};

// Admin reset user password
export const adminResetUserPassword = async (req: Request, res: Response) => {
  try {
    const { userId, newPassword } = req.body;

    // Validate required fields
    if (!userId || !newPassword) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          userId: !userId ? "User ID is required" : undefined,
          newPassword: !newPassword ? "New password is required" : undefined
        }
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: "Password validation failed",
        details: "Password must be at least 8 characters long"
      });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    res.json({ 
      success: true,
      message: "User password reset successfully"
    });
  } catch (error: any) {
    console.error("Admin Reset Password Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
    }

    res.status(500).json({ 
      success: false, 
      error: "Failed to reset user password" 
    });
  }
};

