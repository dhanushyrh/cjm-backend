import { Request, Response } from "express";
import { Transaction } from "sequelize";
import sequelize from "../config/database";
import Admin from "../models/Admin";
import User from "../models/User";
import { hashAdminPassword, compareAdminPassword, generateAdminToken } from "../services/adminAuthService";
import { hashPassword } from "../services/authService";
import { serializeAdmin } from "../serializers/adminSerializer";
import { serializeUser } from "../serializers/userSerializer";
import { createUserScheme } from "../services/userSchemeService";

// Register a new admin
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    const hashedPassword = await hashAdminPassword(password);
    const admin = await Admin.create({ name, email, password: hashedPassword });
    const serializedAdmin = serializeAdmin(admin);

    res.status(201).json({ message: "Admin registered successfully!", admin: serializedAdmin });
  } catch (error: any) {
    console.error("Admin Registration Error:", {
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
    
    res.status(500).json({ error: "Failed to register admin" });
  }
};

// Login admin and return JWT token
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await compareAdminPassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateAdminToken(admin.id);
    const serializedAdmin = serializeAdmin(admin);

    res.json({ 
      message: "Login successful", 
      token,
      admin: serializedAdmin
    });
  } catch (error: any) {
    console.error("Admin Login Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });
    res.status(500).json({ error: "Failed to login" });
  }
};

// Register a new user (admin only)
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, nominee, relation, mobile, address, dob, schemeId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !nominee || !relation || !mobile || !address || !dob || !schemeId) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          name: !name ? "Name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined,
          nominee: !nominee ? "Nominee is required" : undefined,
          relation: !relation ? "Relation is required" : undefined,
          mobile: !mobile ? "Mobile number is required" : undefined,
          address: !address ? "Address is required" : undefined,
          dob: !dob ? "Date of birth is required" : undefined,
          schemeId: !schemeId ? "Scheme ID is required" : undefined
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    // Parse the date to YYYY-MM-DD format for DATEONLY type
    const parsedDob = new Date(dob).toISOString().split('T')[0];
    if (isNaN(new Date(parsedDob).getTime())) {
      return res.status(400).json({ error: "Invalid date format. Please provide date in YYYY-MM-DD format" });
    }

    // Start a transaction to ensure both user and scheme mapping are created
    const result = await sequelize.transaction(async (t: Transaction) => {
      // Create user
      const user = await User.create({ 
        name, 
        email, 
        password: hashedPassword, 
        nominee, 
        relation, 
        address, 
        mobile, 
        dob: parsedDob,
        schemeId 
      }, { transaction: t });
      
      // Create user-scheme mapping
      const userScheme = await createUserScheme(user.id, schemeId, t);

      return { user, userScheme };
    });

    const serializedUser = serializeUser(result.user);

    res.status(201).json({
      message: "User registered successfully!",
      user: serializedUser,
      scheme: result.userScheme
    });
  } catch (error: any) {
    console.error("User Registration Error:", {
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

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ 
        error: "Invalid Scheme ID",
        details: "The provided scheme does not exist"
      });
    }
    
    res.status(500).json({ error: "Failed to register user" });
  }
};
