import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as dailyTaskService from "../services/dailyTaskService";
import logger from "../config/logger";
import { apiError, apiSuccess } from "../utils/apiError";
import { validatePaginationParams } from "../utils/paginationHelper";

export const createDailyTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, task_date, expires_at, is_active } = req.body;
    if (!message || !task_date || !expires_at) {
      return apiError(res, {
        status: 400,
        message: "message, task_date, and expires_at are required",
      });
    }

    const task = await dailyTaskService.createDailyTask({
      title,
      message,
      task_date,
      expires_at: new Date(expires_at),
      is_active,
      created_by: req.user?.id,
    });

    apiSuccess(res, task, "Daily task created successfully");
  } catch (error: any) {
    logger.error("Error creating daily task:", error);
    apiError(res, { status: 500, message: "Failed to create daily task", source: error });
  }
};

export const updateDailyTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, message, task_date, expires_at, is_active } = req.body;
    const task = await dailyTaskService.updateDailyTask(id, {
      title,
      message,
      task_date,
      expires_at: expires_at ? new Date(expires_at) : undefined,
      is_active,
    });
    if (!task) {
      return apiError(res, { status: 404, message: "Daily task not found" });
    }
    apiSuccess(res, task, "Daily task updated successfully");
  } catch (error: any) {
    logger.error("Error updating daily task:", error);
    apiError(res, { status: 500, message: "Failed to update daily task", source: error });
  }
};

export const deleteDailyTask = async (req: AuthRequest, res: Response) => {
  try {
    const ok = await dailyTaskService.softDeleteDailyTask(req.params.id);
    if (!ok) {
      return apiError(res, { status: 404, message: "Daily task not found" });
    }
    apiSuccess(res, null, "Daily task deleted successfully");
  } catch (error: any) {
    logger.error("Error deleting daily task:", error);
    apiError(res, { status: 500, message: "Failed to delete daily task", source: error });
  }
};

export const listDailyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isActive =
      req.query.isActive === "true"
        ? true
        : req.query.isActive === "false"
          ? false
          : undefined;
    const pagination = validatePaginationParams(page, limit);
    if (!pagination.isValid) {
      return apiError(res, { status: 400, message: pagination.message || "Invalid pagination" });
    }
    const result = await dailyTaskService.listDailyTasks(
      pagination.page,
      pagination.limit,
      isActive
    );
    apiSuccess(res, result);
  } catch (error: any) {
    logger.error("Error listing daily tasks:", error);
    apiError(res, { status: 500, message: "Failed to list daily tasks", source: error });
  }
};

export const getTodayTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiError(res, { status: 401, message: "Unauthorized" });
    }
    const tasks = await dailyTaskService.getTodayTasksForUser(userId);
    apiSuccess(res, tasks);
  } catch (error: any) {
    logger.error("Error fetching today's tasks:", error);
    apiError(res, { status: 500, message: "Failed to fetch today's tasks", source: error });
  }
};

export const submitTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiError(res, { status: 401, message: "Unauthorized" });
    }
    const { image_file_id, message } = req.body;
    if (!image_file_id) {
      return apiError(res, { status: 400, message: "image_file_id is required" });
    }
    const submission = await dailyTaskService.submitDailyTask(
      req.params.id,
      userId,
      image_file_id,
      message
    );
    apiSuccess(res, submission, "Task submitted successfully");
  } catch (error: any) {
    logger.error("Error submitting daily task:", error);
    apiError(res, {
      status: error.status || 500,
      message: error.message || "Failed to submit task",
      source: error,
    });
  }
};

export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiError(res, { status: 401, message: "Unauthorized" });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await dailyTaskService.getMySubmissions(userId, page, limit);
    apiSuccess(res, result);
  } catch (error: any) {
    logger.error("Error fetching my submissions:", error);
    apiError(res, { status: 500, message: "Failed to fetch submissions", source: error });
  }
};

export const listSubmissionsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined;
    const search = (req.query.search as string) || undefined;
    const result = await dailyTaskService.listSubmissionsAdmin(page, limit, status, search);
    apiSuccess(res, result);
  } catch (error: any) {
    logger.error("Error listing submissions:", error);
    apiError(res, { status: 500, message: "Failed to list submissions", source: error });
  }
};

export const reviewSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return apiError(res, { status: 401, message: "Unauthorized" });
    }
    const { status, admin_remarks } = req.body;
    if (status !== "APPROVED" && status !== "REJECTED") {
      return apiError(res, {
        status: 400,
        message: "status must be APPROVED or REJECTED",
      });
    }
    const submission = await dailyTaskService.reviewSubmission(
      req.params.id,
      status,
      adminId,
      admin_remarks
    );
    apiSuccess(
      res,
      submission,
      status === "APPROVED" ? "Submission approved and points credited" : "Submission rejected"
    );
  } catch (error: any) {
    logger.error("Error reviewing submission:", error);
    apiError(res, {
      status: error.status || 500,
      message: error.message || "Failed to review submission",
      source: error,
    });
  }
};
