import { RequestHandler, Router } from "express";
import { setGoldPrice, getGoldPrices, getGoldPriceGraph, getCurrentGoldPrice } from "../controllers/goldPriceController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = Router();

// Protected routes (admin only)
router.post("/", authenticateAdmin as RequestHandler, setGoldPrice as RequestHandler);

// Public routes
router.get("/current", getCurrentGoldPrice as RequestHandler);
router.get("/", getGoldPrices as RequestHandler);
router.get("/graph", getGoldPriceGraph as RequestHandler);

export default router; 