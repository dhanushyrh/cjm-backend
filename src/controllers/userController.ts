import { Request, Response } from "express";
import { getAllUsers, deleteUser, updateUserActiveStatus, findUserByUserId, getUserById, updateUserDetails } from "../services/userService";
import { serializeUser, serializeUsers } from "../serializers/userSerializer";
import User from "../models/User";

export const fetchUsers = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid page value",
        details: "Page must be greater than 0"
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid limit value",
        details: "Limit must be between 1 and 100"
      });
    }
    
    const result = await getAllUsers(page, limit);
    const serializedUsers = serializeUsers(result.data);
    
    res.status(200).json({
      success: true,
      data: serializedUsers,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error("User Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ 
      success: false,
      error: "Failed to fetch users" 
    });
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

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Validate required fields
    if (userId === undefined) {
      return res.status(400).json({
        error: "Missing user ID",
        details: "User ID is required"
      });
    }

    if (isActive === undefined) {
      return res.status(400).json({
        error: "Missing isActive status",
        details: "isActive boolean status is required"
      });
    }

    // Validate isActive is boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: "Invalid isActive value",
        details: "isActive must be a boolean value"
      });
    }

    const updatedUser = await updateUserActiveStatus(userId, isActive);
    const serializedUser = serializeUser(updatedUser);

    res.status(200).json({
      message: `User status ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: serializedUser
    });
  } catch (error: any) {
    console.error("User Status Update Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.message === "User not found") {
      return res.status(404).json({
        error: "User not found",
        details: "No user found with the provided ID"
      });
    }

    res.status(500).json({ error: "Failed to update user status" });
  }
};

/**
 * Search for a user by their userId (HS-XXXXXX format)
 */
export const searchUserByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Missing user ID",
        details: "User ID is required"
      });
    }

    const user = await findUserByUserId(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        details: `No user found with ID: ${userId}`
      });
    }

    const serializedUser = serializeUser(user);

    res.status(200).json({
      success: true,
      data: serializedUser
    });
  } catch (error: any) {
    console.error("User Search Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({
      success: false,
      error: "Failed to search for user"
    });
  }
};

/**
 * Get a user by their UUID
 */
export const fetchUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Missing user ID",
        details: "User ID is required"
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        details: `No user found with ID: ${userId}`
      });
    }

    const serializedUser = serializeUser(user);

    res.status(200).json({
      success: true,
      data: serializedUser
    });
  } catch (error: any) {
    console.error("User Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({
      success: false,
      error: "Failed to fetch user"
    });
  }
};

/**
 * Update user details (mobile, DOB, addresses, nominee, relation)
 */
export const updateUserDetailsController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { mobile, dob, current_address, permanent_address, nominee, relation } = req.body;

    // Validate that at least one field to update was provided
    if (!mobile && !dob && !current_address && !permanent_address && !nominee && !relation) {
      return res.status(400).json({
        success: false,
        error: "No update fields provided",
        details: "At least one field to update must be provided"
      });
    }

    // Validate fields if they are provided
    if (dob && isNaN(new Date(dob).getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format",
        details: "Date of birth must be a valid date format (YYYY-MM-DD)"
      });
    }

    // Update the user
    const updatedUser = await updateUserDetails(userId, {
      mobile,
      dob: dob ? new Date(dob) : undefined,
      current_address,
      permanent_address,
      nominee,
      relation
    });

    const serializedUser = serializeUser(updatedUser);

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      data: serializedUser
    });
  } catch (error: any) {
    console.error("User Details Update Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        error: "User not found",
        details: "No user found with the provided ID"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update user details"
    });
  }
};
