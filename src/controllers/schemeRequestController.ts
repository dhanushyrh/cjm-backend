import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as schemeRequestService from "../services/schemeRequestService";

// User endpoints
export const createSchemeRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { desired_gold_grams, desired_item, convenient_time, comments } = req.body;
    
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Input validation
    if (!desired_gold_grams || isNaN(Number(desired_gold_grams))) {
      res.status(400).json({
        success: false,
        message: "Valid desired gold grams is required"
      });
      return;
    }
    
    if (!desired_item) {
      res.status(400).json({
        success: false,
        message: "Desired item is required"
      });
      return;
    }
    
    if (!convenient_time) {
      res.status(400).json({
        success: false,
        message: "Convenient time is required"
      });
      return;
    }
    
    const request = await schemeRequestService.createSchemeRequest(
      userId,
      Number(desired_gold_grams),
      desired_item,
      convenient_time,
      comments || null
    );
    
    res.status(201).json({
      success: true,
      data: request,
      message: "Scheme request created successfully"
    });
  } catch (error) {
    console.error("Error creating scheme request:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create scheme request"
    });
  }
};

export const getUserRequests = async (req: AuthRequest, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    const requests = await schemeRequestService.getUserSchemeRequests(userId);
    
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error("Error getting user scheme requests:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get scheme requests"
    });
  }
};

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Request ID is required"
      });
      return;
    }
    
    const request = await schemeRequestService.getSchemeRequestById(id);
    
    if (!request) {
      res.status(404).json({
        success: false,
        message: "Scheme request not found"
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error("Error getting scheme request by ID:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get scheme request"
    });
  }
};

// Admin endpoints
export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, addressed } = req.query;
    
    const addressedFilter = addressed !== undefined ? 
      addressed === 'true' : undefined;
    
    const result = await schemeRequestService.getAllSchemeRequests(
      Number(page),
      Number(limit),
      addressedFilter
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error getting all scheme requests:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get scheme requests"
    });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_addressed, comments } = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Request ID is required"
      });
      return;
    }
    
    // Make sure at least one updatable field is provided
    if (is_addressed === undefined && comments === undefined) {
      res.status(400).json({
        success: false,
        message: "No update parameters provided"
      });
      return;
    }
    
    // Build update object with only provided fields
    const updates: any = {};
    if (is_addressed !== undefined) updates.is_addressed = is_addressed;
    if (comments !== undefined) updates.comments = comments;
    
    const updatedRequest = await schemeRequestService.updateSchemeRequest(id, updates);
    
    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: "Scheme request updated successfully"
    });
  } catch (error) {
    console.error("Error updating scheme request:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update scheme request"
    });
  }
}; 