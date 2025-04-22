import express, { RequestHandler } from "express";
import { listAllTransactions } from "../controllers/adminTransactionController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions with filters and pagination (admin only)
 * @access  Private (Admin)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} userId - Filter by user ID
 * @query   {string} schemeId - Filter by scheme ID
 * @query   {string} userSchemeId - Filter by user scheme ID
 * @query   {string} transactionType - Filter by transaction type (deposit, withdrawal, points, bonus_withdrawal)
 * @query   {string} startDate - Filter transactions from this date (YYYY-MM-DD)
 * @query   {string} endDate - Filter transactions to this date (YYYY-MM-DD)
 * @query   {number} minAmount - Filter transactions with amount >= minAmount
 * @query   {number} maxAmount - Filter transactions with amount <= maxAmount
 * @query   {string} sortBy - Field to sort by (createdAt, amount, goldGrams, points)
 * @query   {string} sortOrder - Sort order (asc, desc)
 */
router.get("/transactions", authenticateAdmin as RequestHandler, listAllTransactions as RequestHandler);

export default router; 