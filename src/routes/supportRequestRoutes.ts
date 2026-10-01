import express, { RequestHandler } from "express";
import {
  authenticateAdmin,
  authenticateUser,
} from "../middleware/authMiddleware";
import * as supportRequestController from "../controllers/supportRequestController";

const router = express.Router();

/**
 * @swagger
 * /api/support-requests:
 *   post:
 *     tags: [Support Requests]
 *     summary: Submit a support request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *               image_file_ids:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Support request created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticateUser as RequestHandler,
  supportRequestController.createSupportRequest
);

/**
 * @swagger
 * /api/support-requests/user:
 *   get:
 *     tags: [Support Requests]
 *     summary: List support requests for the authenticated user
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/user",
  authenticateUser as RequestHandler,
  supportRequestController.getUserRequests
);

/**
 * @swagger
 * /api/support-requests/admin/all:
 *   get:
 *     tags: [Support Requests]
 *     summary: List all support requests (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 */
router.get(
  "/admin/all",
  authenticateAdmin as RequestHandler,
  supportRequestController.getAllRequests
);

/**
 * @swagger
 * /api/support-requests/{id}:
 *   get:
 *     tags: [Support Requests]
 *     summary: Get support request by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id",
  authenticateAdmin as RequestHandler,
  supportRequestController.getRequestById
);

/**
 * @swagger
 * /api/support-requests/{id}:
 *   patch:
 *     tags: [Support Requests]
 *     summary: Update support request status (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *               admin_remarks:
 *                 type: string
 */
router.patch(
  "/:id",
  authenticateAdmin as RequestHandler,
  supportRequestController.updateRequest
);

export default router;
