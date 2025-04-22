import express, { RequestHandler } from "express";
import {
  createReferralRequest,
  updateReferral,
  getReferralList,
  getReferralDetail
} from "../controllers/referralController";
import { authenticateUser, authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Referral:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the referral
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who created the referral
 *         name:
 *           type: string
 *           description: Name of the referred person
 *         age:
 *           type: integer
 *           description: Age of the referred person
 *         email:
 *           type: string
 *           format: email
 *           description: Email of the referred person
 *         phone:
 *           type: string
 *           description: Phone number of the referred person
 *         convenientDateTime:
 *           type: string
 *           format: date-time
 *           description: Convenient date and time for contacting the referred person
 *         comments:
 *           type: string
 *           description: Additional comments or notes
 *         isAddressed:
 *           type: boolean
 *           description: Flag indicating if the referral has been addressed
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, REJECTED, ON_HOLD]
 *           description: Current status of the referral
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the referral was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the referral was last updated
 */

/**
 * @swagger
 * /api/referrals:
 *   post:
 *     tags: [Referrals]
 *     summary: Create a new referral
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - email
 *               - phone
 *               - convenientDateTime
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the referred person
 *               age:
 *                 type: integer
 *                 description: Age of the referred person
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the referred person
 *               phone:
 *                 type: string
 *                 description: Phone number of the referred person
 *               convenientDateTime:
 *                 type: string
 *                 format: date-time
 *                 description: Convenient date and time for contacting
 *               comments:
 *                 type: string
 *                 description: Additional comments or notes
 *     responses:
 *       201:
 *         description: Referral created successfully
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
 *                   $ref: '#/components/schemas/Referral'
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
router.post("/", (authenticateUser as unknown) as RequestHandler, (createReferralRequest as unknown) as RequestHandler);

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     tags: [Referrals]
 *     summary: Get list of referrals (admin access)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, REJECTED, ON_HOLD]
 *         description: Filter by status
 *       - in: query
 *         name: isAddressed
 *         schema:
 *           type: boolean
 *         description: Filter by addressed status
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
 *         description: List of referrals
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
 *                     referrals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Referral'
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
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
router.get("/", (authenticateAdmin as unknown) as RequestHandler, (getReferralList as unknown) as RequestHandler);

/**
 * @swagger
 * /api/referrals/{referralId}:
 *   get:
 *     tags: [Referrals]
 *     summary: Get referral details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: referralId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the referral to get
 *     responses:
 *       200:
 *         description: Referral details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Referral'
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Server error
 */
router.get("/:referralId", (authenticateAdmin as unknown) as RequestHandler, (getReferralDetail as unknown) as RequestHandler);

/**
 * @swagger
 * /api/referrals/{referralId}:
 *   put:
 *     tags: [Referrals]
 *     summary: Update referral status (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: referralId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the referral to update
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
 *                 enum: [PENDING, COMPLETED, REJECTED, ON_HOLD]
 *                 description: New status for the referral
 *               isAddressed:
 *                 type: boolean
 *                 description: Flag indicating if the referral has been addressed
 *               comments:
 *                 type: string
 *                 description: Additional comments or notes
 *     responses:
 *       200:
 *         description: Referral updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid status
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Server error
 */
router.put("/:referralId", (authenticateAdmin as unknown) as RequestHandler, (updateReferral as unknown) as RequestHandler);

export default router; 