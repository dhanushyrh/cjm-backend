import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as notificationService from "../services/notificationService";
import { NotificationType } from "../models/Notification";
import { log } from "console";

// User endpoints
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { include_viewed } = req.query;
    
    // Parse includeViewed parameter (default to true if not specified)
    const includeViewed = include_viewed === undefined ? true : include_viewed === 'true';
    
    const notifications = await notificationService.getUserNotifications(userId, includeViewed);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Error getting user notifications:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get notifications"
    });
  }
};

export const markNotificationAsViewed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Notification ID is required"
      });
      return;
    }
    
    const notification = await notificationService.markNotificationAsViewed(id, userId);
    
    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as viewed"
    });
  } catch (error) {
    console.error("Error marking notification as viewed:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update notification"
    });
  }
};

export const markAllNotificationsAsViewed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    
    const result = await notificationService.markAllNotificationsAsViewed(userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: `${result.updatedCount} notifications marked as viewed`
    });
  } catch (error) {
    console.error("Error marking all notifications as viewed:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update notifications"
    });
  }
};

// Admin endpoints
export const createBroadcastNotification = async (req: Request, res: Response) => {
  try {
    const { type, title, message, image, data } = req.body;
    
    // Validate required fields
    if (!type || !["INFO", "BONUS"].includes(type)) {
      res.status(400).json({
        success: false,
        message: "Valid notification type (INFO or BONUS) is required"
      });
      return;
    }
    
    if (!title) {
      res.status(400).json({
        success: false,
        message: "Title is required"
      });
      return;
    }
    
    if (!message) {
      res.status(400).json({
        success: false,
        message: "Message is required"
      });
      return;
    }
    
    const result = await notificationService.createBroadcastNotification(
      type as NotificationType,
      title,
      message,
      image,
      data
    );
    
    res.status(201).json({
      success: true,
      data: result,
      message: `Broadcast notification sent to ${result.count} users`
    });
  } catch (error) {
    console.error("Error creating broadcast notification:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create broadcast notification"
    });
  }
}; 