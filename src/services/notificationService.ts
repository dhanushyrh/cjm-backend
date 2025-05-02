import { Op } from "sequelize";
import Notification, { NotificationType } from "../models/Notification";
import User from "../models/User";
import sequelize from "../config/database";

/**
 * Creates a new notification for a specific user
 */
export const createNotification = async (
  userId: string | null,
  type: NotificationType,
  title: string,
  message: string,
  comments: string | null = null,
  image: string | null = null,
  data: any = null
) => {
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      comments,
      image,
      data,
      is_viewed: false,
      viewed_at: null
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Creates a broadcast notification for all active users
 */
export const createBroadcastNotification = async (
  type: NotificationType,
  title: string,
  message: string,
  image: string | null,
  data: any = null
) => {
  const t = await sequelize.transaction();
  
  try {
    // Get all active users
    const users = await User.findAll({
      where: {
        is_active: true
      },
      attributes: ["id"],
      transaction: t
    });

    
    // Create a notification for each user
    const notifications = await Promise.all(
      users.map(user => 
        Notification.create({
          userId: user.id,
          type,
          title,
          message,
          image,
          data,
          is_viewed: false,
          viewed_at: null
        }, { transaction: t })
      )
    );
    
    await t.commit();
    
    return {
      count: notifications.length,
      usersNotified: users.map(user => user.id)
    };
  } catch (error) {
    await t.rollback();
    console.error("Error creating broadcast notifications:", error);
    throw error;
  }
};

/**
 * Get all notifications for a specific user
 */
export const getUserNotifications = async (userId: string, includeViewed: boolean = true) => {
  try {
    const where: any = { userId };
    
    // Filter out viewed notifications if requested
    if (!includeViewed) {
      where.is_viewed = false;
    }
    
    return await Notification.findAll({
      where,
      order: [["createdAt", "DESC"]]
    });
  } catch (error) {
    console.error(`Error getting notifications for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Mark a notification as viewed
 */
export const markNotificationAsViewed = async (id: string, userId: string) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id,
        userId
      }
    });
    
    if (!notification) {
      throw new Error("Notification not found or does not belong to the user");
    }
    
    return await notification.update({
      is_viewed: true,
      viewed_at: new Date()
    });
  } catch (error) {
    console.error(`Error marking notification ${id} as viewed:`, error);
    throw error;
  }
};

/**
 * Mark all notifications for a user as viewed
 */
export const markAllNotificationsAsViewed = async (userId: string) => {
  try {
    const now = new Date();
    
    const [updatedCount] = await Notification.update(
      {
        is_viewed: true,
        viewed_at: now
      },
      {
        where: {
          userId,
          is_viewed: false
        }
      }
    );
    
    return { updatedCount };
  } catch (error) {
    console.error(`Error marking all notifications as viewed for user ${userId}:`, error);
    throw error;
  }
}; 