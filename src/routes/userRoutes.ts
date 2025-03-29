import express, { RequestHandler, Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         mobile:
 *           type: string
 *         address:
 *           type: string
 *         dob:
 *           type: string
 *           format: date
 *         nominee:
 *           type: string
 *         relation:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         schemes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               duration:
 *                 type: integer
 *               goldGrams:
 *                 type: number
 *               monthlyAmount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, CANCELLED]
 */

const router: Router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [User Profile]
 *     summary: Get current user's profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile accessed!"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get("/profile", authenticateUser as RequestHandler, (req: AuthRequest, res) => {
  res.json({ message: "Profile accessed!", user: req.user });
});

export default router;
