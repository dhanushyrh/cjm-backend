import { Request, Response } from "express";
import { getAllUsers, assignUserToScheme, deleteUser } from "../services/userService";
import { serializeUser, serializeUsers } from "../serializers/userSerializer";
import User from "../models/User";

export const fetchUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    const serializedUsers = serializeUsers(users);
    
    res.status(200).json({
      message: "Users fetched successfully",
      data: serializedUsers
    });
  } catch (error: any) {
    console.error("User Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const assignScheme = async (req: Request, res: Response) => {
  try {
    const { userId, schemeId } = req.body;

    // Validate required fields
    if (!userId || !schemeId) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          userId: !userId ? "User ID is required" : undefined,
          schemeId: !schemeId ? "Scheme ID is required" : undefined
        }
      });
    }

    const updatedUser = await assignUserToScheme(userId, schemeId);
    if (!updatedUser) {
      return res.status(404).json({ 
        error: "User not found",
        details: "No user found with the provided ID"
      });
    }

    const serializedUser = serializeUser(updatedUser);
    res.status(200).json({
      message: "Scheme assigned successfully",
      user: serializedUser
    });
  } catch (error: any) {
    console.error("Scheme Assignment Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ 
        error: "Invalid Scheme ID",
        details: "The provided scheme does not exist"
      });
    }

    res.status(500).json({ error: "Failed to assign scheme" });
  }
};

export const removeUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: "Missing user ID",
        details: "User ID is required"
      });
    }

    const deleted : any = await deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ 
        error: "User not found",
        details: "No user found with the provided ID"
      });
    }

    res.status(200).json({ 
      message: "User deleted successfully",
      userId
    });
  } catch (error: any) {
    console.error("User Delete Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to delete user" });
  }
};
