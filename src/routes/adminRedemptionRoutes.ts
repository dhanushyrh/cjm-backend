import express, { RequestHandler } from "express";
import { getRedemptionRequests, updateRedemptionStatus } from "../controllers/adminRedemptionController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin as RequestHandler);

// Get all redemption requests with optional filters
router.get("/requests", (getRedemptionRequests as unknown) as RequestHandler);

// Approve or reject a redemption request
router.put("/requests/:requestId", (updateRedemptionStatus as unknown) as RequestHandler);

export default router; 