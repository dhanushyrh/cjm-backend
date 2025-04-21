import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as circularService from "../services/circularService";
import logger from "../config/logger";
import { validatePaginationParams } from "../utils/paginationHelper";
import { apiError, apiSuccess } from "../utils/apiError";

// Create a new circular
export const createCircular = async (req: Request, res: Response) => {
  try {
    const { title, description, image_url, link, is_active, start_date, end_date, priority } = req.body;

    // Validate required fields
    if (!title || !description || !image_url || !start_date) {
      return apiError(res, {
        status: 400,
        message: "Missing required fields",
        details: "Title, description, image_url, and start_date are required"
      });
    }

    // Create new circular
    const circular = await circularService.createCircular({
      title,
      description,
      image_url,
      link,
      is_active: is_active !== undefined ? is_active : true,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : undefined,
      priority
    });

    apiSuccess(res, circular, "Circular created successfully");
  } catch (error: any) {
    logger.error("Error creating circular:", error);
    apiError(res, {
      status: 500,
      message: "Failed to create circular",
      source: error
    });
  }
};

// Update an existing circular
export const updateCircular = async (req: Request, res: Response) => {
  try {
    const { circularId } = req.params;
    const { title, description, image_url, link, is_active, start_date, end_date, priority } = req.body;

    // Validate circular ID
    if (!circularId) {
      return apiError(res, {
        status: 400,
        message: "Missing circular ID",
        details: "Circular ID is required"
      });
    }

    // Validate at least one field is being updated
    if (!title && !description && image_url === undefined && link === undefined && 
        is_active === undefined && start_date === undefined && end_date === undefined && priority === undefined) {
      return apiError(res, {
        status: 400,
        message: "No update data provided",
        details: "At least one field must be provided for update"
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (link !== undefined) updateData.link = link;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date === null) {
      updateData.end_date = null;
    } else if (end_date) {
      updateData.end_date = new Date(end_date);
    }
    if (priority !== undefined) updateData.priority = priority;

    // Update circular
    const updatedCircular = await circularService.updateCircular(circularId, updateData);

    if (!updatedCircular) {
      return apiError(res, {
        status: 404,
        message: "Circular not found",
        details: `No circular found with ID: ${circularId}`
      });
    }

    apiSuccess(res, updatedCircular, "Circular updated successfully");
  } catch (error: any) {
    logger.error(`Error updating circular:`, error);
    apiError(res, {
      status: 500,
      message: "Failed to update circular",
      source: error
    });
  }
};

// Delete a circular
export const deleteCircular = async (req: Request, res: Response) => {
  try {
    const { circularId } = req.params;

    // Validate circular ID
    if (!circularId) {
      return apiError(res, {
        status: 400,
        message: "Missing circular ID",
        details: "Circular ID is required"
      });
    }

    // Delete circular
    const deleted = await circularService.deleteCircular(circularId);

    if (!deleted) {
      return apiError(res, {
        status: 404,
        message: "Circular not found",
        details: `No circular found with ID: ${circularId}`
      });
    }

    apiSuccess(res, null, "Circular deleted successfully");
  } catch (error: any) {
    logger.error(`Error deleting circular:`, error);
    apiError(res, {
      status: 500,
      message: "Failed to delete circular",
      source: error
    });
  }
};

// Get a specific circular
export const getCircular = async (req: Request, res: Response) => {
  try {
    const { circularId } = req.params;

    // Validate circular ID
    if (!circularId) {
      return apiError(res, {
        status: 400,
        message: "Missing circular ID",
        details: "Circular ID is required"
      });
    }

    // Get circular
    const circular = await circularService.getCircular(circularId);

    if (!circular) {
      return apiError(res, {
        status: 404,
        message: "Circular not found",
        details: `No circular found with ID: ${circularId}`
      });
    }

    apiSuccess(res, circular);
  } catch (error: any) {
    logger.error(`Error fetching circular:`, error);
    apiError(res, {
      status: 500,
      message: "Failed to fetch circular",
      source: error
    });
  }
};

// Get all circulars with pagination
export const getAllCirculars = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate pagination parameters
    const paginationParams = validatePaginationParams(page, limit);
    if (!paginationParams.isValid) {
      return apiError(res, {
        status: 400,
        message: paginationParams.message,
        details: "Invalid pagination parameters"
      });
    }

    // Get circulars
    const result = await circularService.getAllCirculars(paginationParams.page, paginationParams.limit);

    apiSuccess(res, result);
  } catch (error: any) {
    logger.error("Error fetching all circulars:", error);
    apiError(res, {
      status: 500,
      message: "Failed to fetch circulars",
      source: error
    });
  }
};

// Get active circulars
export const getActiveCirculars = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        status: "error",
        message: "Page must be greater than or equal to 1",
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        status: "error",
        message: "Limit must be between 1 and 100",
      });
    }

    const circulars = await circularService.getActiveCirculars(page, limit);

    return res.status(200).json({
      status: "success",
      data: circulars,
    });
  } catch (error) {
    console.error("Error getting active circulars:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while getting active circulars",
    });
  }
};

/**
 * Get public active circulars without authentication
 */
export const getPublicActiveCirculars = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        status: "error",
        message: "Page must be greater than or equal to 1",
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        status: "error",
        message: "Limit must be between 1 and 100",
      });
    }

    const circulars = await circularService.getActiveCirculars(page, limit);

    return res.status(200).json({
      status: "success",
      data: circulars,
    });
  } catch (error) {
    console.error("Error getting public active circulars:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while getting public active circulars",
    });
  }
};

// Get authenticated user's circulars with viewed status
export const getMyCirculars = async (req: AuthRequest, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      return apiError(res, {
        status: 401,
        message: "Unauthorized",
        details: "User ID not found in token"
      });
    }

    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate pagination parameters
    const paginationParams = validatePaginationParams(page, limit);
    if (!paginationParams.isValid) {
      return apiError(res, {
        status: 400,
        message: paginationParams.message,
        details: "Invalid pagination parameters"
      });
    }

    // Get user's circulars
    const result = await circularService.getUserCirculars(userId, paginationParams.page, paginationParams.limit);

    apiSuccess(res, result);
  } catch (error: any) {
    logger.error("Error fetching user circulars:", error);
    apiError(res, {
      status: 500,
      message: "Failed to fetch circulars",
      source: error
    });
  }
};

// Mark a circular as viewed by authenticated user
export const markCircularAsViewed = async (req: AuthRequest, res: Response) => {
  try {
    const { circularId } = req.params;
    
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      return apiError(res, {
        status: 401,
        message: "Unauthorized",
        details: "User ID not found in token"
      });
    }

    // Validate circular ID
    if (!circularId) {
      return apiError(res, {
        status: 400,
        message: "Missing circular ID",
        details: "Circular ID is required"
      });
    }

    // Mark circular as viewed
    const view = await circularService.markCircularAsViewed(circularId, userId);

    apiSuccess(res, view, "Circular marked as viewed");
  } catch (error: any) {
    logger.error("Error marking circular as viewed:", error);
    apiError(res, {
      status: 500,
      message: "Failed to mark circular as viewed",
      source: error
    });
  }
};

// Get view count for a circular
export const getCircularViewCount = async (req: Request, res: Response) => {
  try {
    const { circularId } = req.params;

    // Validate circular ID
    if (!circularId) {
      return apiError(res, {
        status: 400,
        message: "Missing circular ID",
        details: "Circular ID is required"
      });
    }

    // Get view count
    const count = await circularService.getCircularViewCount(circularId);

    apiSuccess(res, { count });
  } catch (error: any) {
    logger.error("Error getting circular view count:", error);
    apiError(res, {
      status: 500,
      message: "Failed to get view count",
      source: error
    });
  }
};

// Get detailed view information for a circular
export const getCircularViewDetails = async (req: Request, res: Response) => {
  try {
    const { circularId } = req.params;

    // Validate circular ID
    if (!circularId) {
      return apiError(res, {
        status: 400,
        message: "Missing circular ID",
        details: "Circular ID is required"
      });
    }

    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate pagination parameters
    const paginationParams = validatePaginationParams(page, limit);
    if (!paginationParams.isValid) {
      return apiError(res, {
        status: 400,
        message: paginationParams.message,
        details: "Invalid pagination parameters"
      });
    }

    // Get view details
    const result = await circularService.getCircularViewDetails(circularId, paginationParams.page, paginationParams.limit);

    apiSuccess(res, result);
  } catch (error: any) {
    logger.error("Error getting circular view details:", error);
    apiError(res, {
      status: 500,
      message: "Failed to get view details",
      source: error
    });
  }
};

export const getUserCirculars = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "error",
        message: "User not authenticated or user ID not found in token",
      });
    }

    // Extract user ID as string (not number)
    const userId = req.user.id.toString();
    
    // Parse pagination params
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        status: "error",
        message: "Page must be greater than or equal to 1",
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        status: "error",
        message: "Limit must be between 1 and 100",
      });
    }
    
    const circulars = await circularService.getUserCirculars(userId, page, limit);

    return res.status(200).json({
      status: "success",
      data: circulars,
    });
  } catch (error) {
    console.error("Error getting user circulars:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while getting user circulars",
    });
  }
}; 