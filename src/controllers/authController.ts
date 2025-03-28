import { Request, Response } from "express";
import User from "../models/User";
import { comparePassword, generateToken } from "../services/authService";
import { serializeUser } from "../serializers/userSerializer";

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
