import express, { RequestHandler } from "express";
import { checkEligibility, redeemUserPoints } from "../controllers/pointRedemptionController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// All routes require user authentication
router.use(authenticateUser as RequestHandler);

// Check redemption eligibility
router.get("/check/:userSchemeId", (checkEligibility as unknown) as RequestHandler);

// Redeem points
router.post("/redeem/:userSchemeId", (redeemUserPoints as unknown) as RequestHandler);

export default router; 