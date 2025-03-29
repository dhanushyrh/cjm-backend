import express, { RequestHandler } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import * as userSchemeController from "../controllers/userSchemeController";

const router = express.Router();

/**
 * @swagger
 * /api/user-schemes:
 *   post:
 *     tags: [User Schemes]
 *     summary: Create a new user scheme
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - schemeId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               schemeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User scheme created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userScheme:
 *                       $ref: '#/components/schemas/UserScheme'
 *                     initialDeposit:
 *                       $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateUser as RequestHandler, userSchemeController.createUserScheme);

/**
 * @swagger
 * /api/user-schemes/user/{userId}:
 *   get:
 *     tags: [User Schemes]
 *     summary: Get all schemes for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of user schemes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserScheme'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/user/:userId", authenticateUser as RequestHandler, userSchemeController.getUserSchemes);

/**
 * @swagger
 * /api/user-schemes/active/{userId}/{schemeId}:
 *   get:
 *     tags: [User Schemes]
 *     summary: Get active scheme for a user and scheme combination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: schemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Active user scheme
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserScheme'
 *       404:
 *         description: Active scheme not found
 *       401:
 *         description: Unauthorized
 */
router.get("/active/:userId/:schemeId", authenticateUser as RequestHandler, userSchemeController.getActiveUserScheme);

/**
 * @swagger
 * /api/user-schemes/{userSchemeId}/status:
 *   patch:
 *     tags: [User Schemes]
 *     summary: Update user scheme status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, WITHDRAWN]
 *     responses:
 *       200:
 *         description: User scheme status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserScheme'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.patch("/:userSchemeId/status", authenticateUser as RequestHandler, userSchemeController.updateUserSchemeStatus);

/**
 * @swagger
 * /api/user-schemes/{userSchemeId}/points:
 *   patch:
 *     tags: [User Schemes]
 *     summary: Update user scheme points
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
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
 *             required:
 *               - points
 *             properties:
 *               points:
 *                 type: integer
 *                 description: Points to add (positive) or subtract (negative)
 *     responses:
 *       200:
 *         description: User scheme points updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserScheme'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.patch("/:userSchemeId/points", authenticateUser as RequestHandler, userSchemeController.updateUserSchemePoints);

/**
 * @swagger
 * /api/user-schemes/expired:
 *   get:
 *     tags: [User Schemes]
 *     summary: Get all expired schemes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expired user schemes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserScheme'
 *       401:
 *         description: Unauthorized
 */
router.get("/expired", authenticateUser as RequestHandler as RequestHandler, userSchemeController.getExpiredSchemes);

/**
 * @swagger
 * components:
 *   schemas:
 *     UserScheme:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         schemeId:
 *           type: string
 *           format: uuid
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         totalPoints:
 *           type: integer
 *         availablePoints:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, WITHDRAWN]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/User'
 *         scheme:
 *           $ref: '#/components/schemas/Scheme'
 */

export default router; 