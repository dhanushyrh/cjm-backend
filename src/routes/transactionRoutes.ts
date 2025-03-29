import { RequestHandler, Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import {
  getSchemeTransactions,
  getSchemeTransactionSummary,
  getAllUserTransactions,
  getAllUserTransactionSummary,
  exportTransactions
} from "../controllers/transactionController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TransactionSummary:
 *       type: object
 *       properties:
 *         totalDeposits:
 *           type: number
 *         totalWithdrawals:
 *           type: number
 *         totalPoints:
 *           type: integer
 *         totalGoldGrams:
 *           type: number
 *         transactionCount:
 *           type: integer
 *         lastTransaction:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             type:
 *               type: string
 *               enum: [DEPOSIT, WITHDRAWAL, BONUS]
 *             amount:
 *               type: number
 *             createdAt:
 *               type: string
 *               format: date-time
 */

// Protected routes (user only)
router.use(authenticateUser as RequestHandler);

/**
 * @swagger
 * /api/transactions/scheme/{userSchemeId}:
 *   get:
 *     tags: [User Transactions]
 *     summary: Get transactions for a specific scheme
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DEPOSIT, WITHDRAWAL, BONUS]
 *         description: Filter transactions by type
 *     responses:
 *       200:
 *         description: List of transactions for the scheme
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       goldGrams:
 *                         type: number
 *                       points:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheme not found
 */
router.get("/scheme/:userSchemeId", getSchemeTransactions);

/**
 * @swagger
 * /api/transactions/scheme/{userSchemeId}/summary:
 *   get:
 *     tags: [User Transactions]
 *     summary: Get transaction summary for a specific scheme
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction summary for the scheme
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionSummary'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheme not found
 */
router.get("/scheme/:userSchemeId/summary", getSchemeTransactionSummary);

/**
 * @swagger
 * /api/transactions/user:
 *   get:
 *     tags: [User Transactions]
 *     summary: Get all transactions across all schemes for the user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DEPOSIT, WITHDRAWAL, BONUS]
 *         description: Filter transactions by type
 *     responses:
 *       200:
 *         description: List of all user transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       goldGrams:
 *                         type: number
 *                       points:
 *                         type: integer
 *                       schemeName:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/user", getAllUserTransactions as RequestHandler);

/**
 * @swagger
 * /api/transactions/user/summary:
 *   get:
 *     tags: [User Transactions]
 *     summary: Get transaction summary across all schemes for the user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction summary for all schemes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overall:
 *                   $ref: '#/components/schemas/TransactionSummary'
 *                 schemeWise:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       schemeId:
 *                         type: string
 *                         format: uuid
 *                       schemeName:
 *                         type: string
 *                       summary:
 *                         $ref: '#/components/schemas/TransactionSummary'
 *       401:
 *         description: Unauthorized
 */
router.get("/user/summary", getAllUserTransactionSummary as RequestHandler);

/**
 * @swagger
 * /api/transactions/export:
 *   get:
 *     tags: [User Transactions]
 *     summary: Export user transactions to CSV
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DEPOSIT, WITHDRAWAL, BONUS]
 *         description: Filter transactions by type
 *       - in: query
 *         name: schemeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter transactions by scheme
 *     responses:
 *       200:
 *         description: CSV file containing transactions
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
router.get("/export", exportTransactions as RequestHandler);

export default router; 