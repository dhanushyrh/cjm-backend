import express, { RequestHandler } from "express";
import { getRedemptionRequests, updateRedemptionStatus } from "../controllers/adminRedemptionController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/admin/redemption/requests:
 *   get:
 *     tags: [Admin Redemption]
 *     summary: Get all redemption requests
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter requests by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of redemption requests
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RedemptionRequest'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not an admin
 */
router.use(authenticateAdmin as RequestHandler);
router.get("/requests", (getRedemptionRequests as unknown) as RequestHandler);

/**
 * @swagger
 * /api/admin/redemption/requests/{requestId}:
 *   put:
 *     tags: [Admin Redemption]
 *     summary: Update redemption request status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the redemption request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               remarks:
 *                 type: string
 *                 description: Admin remarks for the decision
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RedemptionRequest'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not an admin
 *       404:
 *         description: Request not found
 */
router.put("/requests/:requestId", (updateRedemptionStatus as unknown) as RequestHandler);

export default router; 