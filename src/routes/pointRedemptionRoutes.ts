import express, { RequestHandler } from "express";
import { checkEligibility, redeemUserPoints, getMyRedemptionRequests } from "../controllers/pointRedemptionController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RedemptionEligibility:
 *       type: object
 *       properties:
 *         isEligible:
 *           type: boolean
 *           description: Whether the user is eligible for redemption
 *         reason:
 *           type: string
 *           description: Reason for ineligibility if applicable
 *         availablePoints:
 *           type: number
 *           description: Current available points
 *         minimumPoints:
 *           type: number
 *           description: Minimum points required for redemption
 *         pointsNeeded:
 *           type: number
 *           description: Additional points needed to reach minimum (if applicable)
 *     RedemptionRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userSchemeId:
 *           type: string
 *           format: uuid
 *         points:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         type:
 *           type: string
 *           enum: [BONUS, MATURITY]
 */

/**
 * @swagger
 * /api/points/check/{userSchemeId}:
 *   get:
 *     tags: [Point Redemption]
 *     summary: Check redemption eligibility
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user scheme
 *     responses:
 *       200:
 *         description: Eligibility check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RedemptionEligibility'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User scheme not found
 */
router.use(authenticateUser as RequestHandler);
router.get("/check/:userSchemeId", (checkEligibility as unknown) as RequestHandler);

/**
 * @swagger
 * /api/points/redeem/{userSchemeId}:
 *   post:
 *     tags: [Point Redemption]
 *     summary: Create a redemption request
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: number
 *                 description: Number of points to redeem
 *             required:
 *               - points
 *     responses:
 *       200:
 *         description: Redemption request created successfully
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
 *         description: Invalid request or insufficient points
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User scheme not found
 */
router.post("/redeem/:userSchemeId", (redeemUserPoints as unknown) as RequestHandler);

/**
 * @swagger
 * /api/points/my-requests:
 *   get:
 *     tags: [Point Redemption]
 *     summary: Get authenticated user's redemption requests
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
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
 *         description: List of user's redemption requests
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
 */
router.get("/requests", (getMyRedemptionRequests as unknown) as RequestHandler);

export default router; 