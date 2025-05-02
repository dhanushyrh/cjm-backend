import express, { RequestHandler } from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/authMiddleware";
import * as notificationController from "../controllers/notificationController";

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_viewed
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to include already viewed notifications
 *     responses:
 *       200:
 *         description: List of user's notifications
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticateUser as RequestHandler, notificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/{id}/mark-viewed:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a specific notification as viewed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as viewed
 *       400:
 *         description: Bad request - missing notification ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch("/:id/mark-viewed", authenticateUser as RequestHandler, notificationController.markNotificationAsViewed);

/**
 * @swagger
 * /api/notifications/mark-all-viewed:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all user's notifications as viewed
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as viewed
 *       401:
 *         description: Unauthorized
 */
router.patch("/mark-all-viewed", authenticateUser as RequestHandler, notificationController.markAllNotificationsAsViewed);

/**
 * @swagger
 * /api/notifications/broadcast:
 *   post:
 *     tags: [Notifications]
 *     summary: Create a broadcast notification for all active users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INFO, BONUS]
 *                 description: Type of notification
 *               title:
 *                 type: string
 *                 description: Title of the notification
 *               message:
 *                 type: string
 *                 description: Content of the notification
 *               image:
 *                 type: string
 *                 description: URL to an image for the notification
 *               data:
 *                 type: object
 *                 description: Additional data to include with the notification
 *     responses:
 *       201:
 *         description: Broadcast notification created
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/broadcast", authenticateAdmin as RequestHandler, notificationController.createBroadcastNotification);

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         type:
 *           type: string
 *           enum: [INFO, BONUS]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         image:
 *           type: string
 *           nullable: true
 *         data:
 *           type: object
 *           nullable: true
 *         is_viewed:
 *           type: boolean
 *         viewed_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router; 