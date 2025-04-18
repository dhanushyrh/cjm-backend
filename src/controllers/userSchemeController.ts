import { Request, Response } from "express";
import * as userSchemeService from "../services/userSchemeService";
import UserScheme, { UserSchemeStatus } from "../models/UserScheme";
import User from "../models/User";
import Scheme from "../models/Scheme";
import { AuthRequest } from "../middleware/authMiddleware";

const VALID_STATUSES = ["ACTIVE", "COMPLETED", "WITHDRAWN"] as const;

export const createUserScheme = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      userId, 
      schemeId, 
      desired_item,
      payment_mode,
      payment_details,
      supporting_document_url,
      amount,
      payment_date 
    } = req.body;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required"
      });
      return;
    }
    
    // Skip scheme creation if schemeId is not provided
    if (!schemeId) {
      res.status(201).json({
        success: true,
        message: "User scheme creation skipped - no scheme selected",
        data: null
      });
      return;
    }
    
    // Prepare payment info if available
    let paymentInfo = undefined;
    if (payment_mode && payment_details && amount && payment_date) {
      paymentInfo = {
        payment_mode,
        payment_details,
        supporting_document_url: supporting_document_url || null,
        amount: parseFloat(amount),
        payment_date: new Date(payment_date)
      };
    }
    
    const result = await userSchemeService.createUserScheme(userId, schemeId, undefined, desired_item, paymentInfo);
    
    // Prepare response with bonus points information
    const response = {
      success: true,
      data: result,
      message: result.bonusPoints && result.bonusPoints > 0 
        ? `User scheme created successfully with ${result.bonusPoints} bonus points` 
        : "User scheme created successfully"
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating user scheme:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create user scheme"
    });
  }
};

export const getUserSchemes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get userId from the authenticated user token instead of params
    const userId = req.user.id;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID not found in token"
      });
      return;
    }
    
    const schemes = await userSchemeService.getUserSchemes(userId);
    
    res.status(200).json({
      success: true,
      data: schemes
    });
  } catch (error) {
    console.error("Error getting user schemes:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get user schemes"
    });
  }
};

export const getActiveUserScheme = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, schemeId } = req.params;
    
    if (!userId || !schemeId) {
      res.status(400).json({
        success: false,
        message: "User ID and Scheme ID are required"
      });
      return;
    }
    
    const scheme = await userSchemeService.getActiveUserScheme(userId, schemeId);
    
    if (!scheme) {
      res.status(404).json({
        success: false,
        message: "Active scheme not found"
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    console.error("Error getting active user scheme:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get active user scheme"
    });
  }
};

export const updateUserSchemeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userSchemeId } = req.params;
    const { status } = req.body;
    
    if (!userSchemeId) {
      res.status(400).json({
        success: false,
        message: "User scheme ID is required"
      });
      return;
    }
    
    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
      return;
    }
    
    const updatedScheme = await userSchemeService.updateUserSchemeStatus(userSchemeId, status);
    
    res.status(200).json({
      success: true,
      data: updatedScheme
    });
  } catch (error) {
    console.error("Error updating user scheme status:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update user scheme status"
    });
  }
};

export const updateUserSchemePoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userSchemeId } = req.params;
    const { points } = req.body;
    
    if (!userSchemeId) {
      res.status(400).json({
        success: false,
        message: "User scheme ID is required"
      });
      return;
    }
    
    if (typeof points !== 'number') {
      res.status(400).json({
        success: false,
        message: "Points must be a number"
      });
      return;
    }
    
    const updatedScheme = await userSchemeService.updateUserSchemePoints(userSchemeId, points);
    
    res.status(200).json({
      success: true,
      data: updatedScheme
    });
  } catch (error) {
    console.error("Error updating user scheme points:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update user scheme points"
    });
  }
};

export const getExpiredSchemes = async (req: Request, res: Response): Promise<void> => {
  try {
    const schemes = await userSchemeService.getExpiredSchemes();
    
    res.status(200).json({
      success: true,
      data: schemes
    });
  } catch (error) {
    console.error("Error getting expired schemes:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get expired schemes"
    });
  }
};

export const updateUserSchemeDesiredItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userSchemeId } = req.params;
    const { desired_item } = req.body;
    
    if (!userSchemeId) {
      res.status(400).json({
        success: false,
        message: "User scheme ID is required"
      });
      return;
    }
    
    // desired_item can be null or a string
    if (desired_item !== null && desired_item !== undefined && typeof desired_item !== 'string') {
      res.status(400).json({
        success: false,
        message: "desired_item must be a string or null"
      });
      return;
    }
    
    const updatedScheme = await userSchemeService.updateUserSchemeDesiredItem(userSchemeId, desired_item);
    
    res.status(200).json({
      success: true,
      data: updatedScheme,
      message: "Desired item updated successfully"
    });
  } catch (error) {
    console.error("Error updating user scheme desired item:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update user scheme desired item"
    });
  }
};

// Get all user schemes (admin only)
export const getAllUserSchemes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const offset = (pageNumber - 1) * pageSize;
    
    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    
    // Get all user schemes with pagination
    const { count, rows } = await UserScheme.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"]
        },
        {
          model: Scheme,
          as: "scheme",
          attributes: ["id", "name", "duration", "goldGrams"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset
    });
    
    res.json({
      success: true,
      data: {
        userSchemes: rows,
        pagination: {
          total: count,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(count / pageSize)
        }
      }
    });
  } catch (error) {
    console.error("Error getting all user schemes:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get user schemes"
    });
  }
};

export const updateCertificateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userSchemeId } = req.params;
    const { certificate_delivered } = req.body;
    
    if (!userSchemeId) {
      res.status(400).json({
        success: false,
        message: "User scheme ID is required"
      });
      return;
    }
    
    if (typeof certificate_delivered !== 'boolean') {
      res.status(400).json({
        success: false,
        message: "certificate_delivered must be a boolean value"
      });
      return;
    }
    
    const updatedScheme = await userSchemeService.updateCertificateDeliveryStatus(userSchemeId, certificate_delivered);
    
    res.status(200).json({
      success: true,
      message: certificate_delivered ? "Certificate marked as delivered" : "Certificate marked as not delivered",
      data: updatedScheme
    });
  } catch (error) {
    console.error("Error updating certificate delivery status:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update certificate delivery status"
    });
  }
}; 