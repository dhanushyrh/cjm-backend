import { Router, RequestHandler } from "express";
import * as circularController from "../controllers/circularController";
import { authenticateUser, authenticateAdmin } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/circulars:
 *   post:
 *     tags:
 *       - Circulars
 *     summary: Create a new circular
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Circular created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticateAdmin as RequestHandler, circularController.createCircular as RequestHandler);

/**
 * @swagger
 * /api/circulars/{circularId}:
 *   put:
 *     tags:
 *       - Circulars
 *     summary: Update an existing circular
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: circularId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the circular to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Circular updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Circular not found
 *       500:
 *         description: Server error
 */
router.put("/:circularId", authenticateAdmin as RequestHandler, circularController.updateCircular as RequestHandler);

/**
 * @swagger
 * /api/circulars/{circularId}:
 *   delete:
 *     tags:
 *       - Circulars
 *     summary: Delete a circular
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: circularId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the circular to delete
 *     responses:
 *       200:
 *         description: Circular deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Circular not found
 *       500:
 *         description: Server error
 */
router.delete("/:circularId", authenticateAdmin as RequestHandler, circularController.deleteCircular as RequestHandler);

/**
 * @swagger
 * /api/circulars/{circularId}:
 *   get:
 *     tags:
 *       - Circulars
 *     summary: Get a specific circular
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: circularId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the circular to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved circular
 *       404:
 *         description: Circular not found
 *       500:
 *         description: Server error
 */
router.get("/:circularId", authenticateAdmin as RequestHandler, circularController.getCircular as RequestHandler);

/**
 * @swagger
 * /api/circulars:
 *   get:
 *     tags:
 *       - Circulars
 *     summary: Get all circulars with pagination
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of circulars
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateAdmin as RequestHandler, circularController.getAllCirculars as RequestHandler);

/**
 * @swagger
 * /api/circulars/active/list:
 *   get:
 *     tags:
 *       - Circulars
 *     summary: Get active circulars
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of active circulars
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/active/list", authenticateAdmin as RequestHandler, (circularController.getActiveCirculars as unknown) as RequestHandler);

/**
 * @swagger
 * /api/circulars/my/list:
 *   get:
 *     tags:
 *       - Circulars
 *     summary: Get circulars for authenticated user with viewed status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of circulars with viewed status
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/my/list", authenticateUser as RequestHandler, circularController.getMyCirculars as RequestHandler);

/**
 * @swagger
 * /api/circulars/{circularId}/view:
 *   post:
 *     tags:
 *       - Circulars
 *     summary: Mark a circular as viewed by authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: circularId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the circular to mark as viewed
 *     responses:
 *       200:
 *         description: Circular marked as viewed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:circularId/view", authenticateUser as RequestHandler, circularController.markCircularAsViewed as RequestHandler);

/**
 * @swagger
 * /api/circulars/{circularId}/view-count:
 *   get:
 *     tags:
 *       - Circulars
 *     summary: Get view count for a circular
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: circularId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the circular to get view count for
 *     responses:
 *       200:
 *         description: View count retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:circularId/view-count", authenticateAdmin as RequestHandler, circularController.getCircularViewCount as RequestHandler);

/**
 * @swagger
 * /api/circulars/{circularId}/view-details:
 *   get:
 *     tags:
 *       - Circulars
 *     summary: Get detailed view information for a circular
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: circularId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the circular to get view details for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: View details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:circularId/view-details", authenticateAdmin as RequestHandler, circularController.getCircularViewDetails as RequestHandler);

/**
 * @swagger
 * /api/circulars/user/circulars:
 *   get:
 *     tags:
 *       - Circulars
 *     summary: Get user circulars
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of user circulars
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/user/circulars", authenticateUser as RequestHandler, (circularController.getUserCirculars as unknown) as RequestHandler);

export default router; 