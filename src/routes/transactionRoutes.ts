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

// Protected routes (user only)
router.use(authenticateUser as RequestHandler);

// Scheme-specific transaction routes
router.get("/scheme/:userSchemeId", getSchemeTransactions);
router.get("/scheme/:userSchemeId/summary", getSchemeTransactionSummary);

// User's all schemes transaction routes
router.get("/user", getAllUserTransactions  as RequestHandler);
router.get("/user/summary", getAllUserTransactionSummary  as RequestHandler);

// Export route
router.get("/export", exportTransactions  as RequestHandler);

export default router; 