import express, { Router, RequestHandler } from "express";
import { loginUser, changeUserPassword, adminResetUserPassword } from "../controllers/authController";
import { authenticateUser, authenticateAdmin } from "../middleware/authMiddleware";

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           format: password
 *           description: User's current password
 *         newPassword:
 *           type: string
 *           format: password
 *           description: User's new password
 *     AdminResetPasswordRequest:
 *       type: object
 *       required:
 *         - userId
 *         - newPassword
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user whose password is being reset
 *         newPassword:
 *           type: string
 *           format: password
 *           description: New password for the user
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Authentication failed
 */
router.post("/login", loginUser as RequestHandler);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change user password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *         description: Invalid request parameters
 *       401:
 *         description: Authentication failed or current password incorrect
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/change-password", authenticateUser as RequestHandler, changeUserPassword as RequestHandler);

/**
 * @swagger
 * /api/auth/admin/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Admin reset user password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *         description: Invalid request parameters
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/admin/reset-password", authenticateAdmin as RequestHandler, adminResetUserPassword as RequestHandler);

export default router;
