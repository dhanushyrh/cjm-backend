import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as supportRequestService from "../services/supportRequestService";
import { SupportRequestStatus } from "../models/SupportRequest";

export const createSupportRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, image_file_ids } = req.body;
    const userId = req.user.id;

    if (!title || typeof title !== "string" || !title.trim()) {
      res.status(400).json({
        success: false,
        message: "Title is required",
      });
      return;
    }

    if (title.trim().length > 200) {
      res.status(400).json({
        success: false,
        message: "Title must be 200 characters or less",
      });
      return;
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      res.status(400).json({
        success: false,
        message: "Description is required",
      });
      return;
    }

    if (image_file_ids !== undefined && !Array.isArray(image_file_ids)) {
      res.status(400).json({
        success: false,
        message: "image_file_ids must be an array",
      });
      return;
    }

    if (Array.isArray(image_file_ids) && image_file_ids.length > 3) {
      res.status(400).json({
        success: false,
        message: "Maximum 3 images allowed",
      });
      return;
    }

    const request = await supportRequestService.createSupportRequest(
      userId,
      title,
      description,
      image_file_ids || []
    );

    res.status(201).json({
      success: true,
      data: request,
      message: "Support request submitted successfully",
    });
  } catch (error) {
    console.error("Error creating support request:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create support request";
    const status =
      message.includes("Maximum") || message.includes("invalid") ? 400 : 500;
    res.status(status).json({
      success: false,
      message,
    });
  }
};

export const getUserRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const requests = await supportRequestService.getUserSupportRequests(userId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error getting user support requests:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get support requests",
    });
  }
};

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
      return;
    }

    const request = await supportRequestService.getSupportRequestById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        message: "Support request not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error getting support request by ID:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get support request",
    });
  }
};

export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let statusFilter: SupportRequestStatus | undefined;
    if (status !== undefined && status !== "") {
      const value = String(status).toUpperCase();
      if (
        !Object.values(SupportRequestStatus).includes(
          value as SupportRequestStatus
        )
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
        return;
      }
      statusFilter = value as SupportRequestStatus;
    }

    const result = await supportRequestService.getAllSupportRequests(
      Number(page),
      Number(limit),
      statusFilter
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting all support requests:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get support requests",
    });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
      return;
    }

    if (status === undefined && admin_remarks === undefined) {
      res.status(400).json({
        success: false,
        message: "No update parameters provided",
      });
      return;
    }

    if (status !== undefined) {
      const value = String(status).toUpperCase();
      if (
        !Object.values(SupportRequestStatus).includes(
          value as SupportRequestStatus
        )
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid status",
        });
        return;
      }
    }

    const updates: {
      status?: SupportRequestStatus;
      admin_remarks?: string | null;
    } = {};

    if (status !== undefined) {
      updates.status = String(status).toUpperCase() as SupportRequestStatus;
    }
    if (admin_remarks !== undefined) {
      updates.admin_remarks = admin_remarks;
    }

    const updatedRequest = await supportRequestService.updateSupportRequest(
      id,
      updates
    );

    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: "Support request updated successfully",
    });
  } catch (error) {
    console.error("Error updating support request:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update support request";
    const statusCode = message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
