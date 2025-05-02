import express, { RequestHandler } from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/authMiddleware";
import * as schemeRequestController from "../controllers/schemeRequestController";

const router = express.Router();

/**
 * @swagger
 * /api/scheme-requests:
 *   post:
 *     tags: [Scheme Requests]
 *     summary: Create a new scheme request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - desired_gold_grams
 *               - desired_item
 *               - convenient_time
 *             properties:
 *               desired_gold_grams:
 *                 type: number
 *                 format: float
 *                 description: Desired gold in grams
 *               desired_item:
 *                 type: string
 *                 description: Description of the desired gold item
 *               convenient_time:
 *                 type: string
 *                 description: User's convenient time for contact
 *               comments:
 *                 type: string
 *                 description: Additional comments or notes
 *     responses:
 *       201:
 *         description: Scheme request created successfully
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateUser as RequestHandler, schemeRequestController.createSchemeRequest);

/**
 * @swagger
 * /api/scheme-requests/user:
 *   get:
 *     tags: [Scheme Requests]
 *     summary: Get all scheme requests for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's scheme requests
 *       401:
 *         description: Unauthorized
 */
router.get("/user", authenticateUser as RequestHandler, schemeRequestController.getUserRequests);

/**
 * @swagger
 * /api/scheme-requests/{id}:
 *   get:
 *     tags: [Scheme Requests]
 *     summary: Get scheme request by ID
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
 *         description: Scheme request details
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticateUser as RequestHandler, schemeRequestController.getRequestById);

/**
 * @swagger
 * /api/scheme-requests/admin/all:
 *   get:
 *     tags: [Scheme Requests]
 *     summary: Get all scheme requests (admin only)
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
 *         name: addressed
 *         schema:
 *           type: boolean
 *         description: Filter by addressed status
 *     responses:
 *       200:
 *         description: List of all scheme requests with pagination
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/admin/all", authenticateAdmin as RequestHandler, schemeRequestController.getAllRequests);

/**
 * @swagger
 * /api/scheme-requests/{id}:
 *   patch:
 *     tags: [Scheme Requests]
 *     summary: Update scheme request (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_addressed:
 *                 type: boolean
 *                 description: Mark request as addressed
 *               comments:
 *                 type: string
 *                 description: Admin comments or notes
 *     responses:
 *       200:
 *         description: Scheme request updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.patch("/:id", authenticateAdmin as RequestHandler, schemeRequestController.updateRequest);

/**
 * @swagger
 * components:
 *   schemas:
 *     SchemeRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         desired_gold_grams:
 *           type: number
 *           format: float
 *         desired_item:
 *           type: string
 *         convenient_time:
 *           type: string
 *         is_addressed:
 *           type: boolean
 *         comments:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router; 