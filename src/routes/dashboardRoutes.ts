import { RequestHandler, Router } from "express";
import { getDashboard } from "../controllers/dashboardController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = Router();

// All dashboard routes require admin authentication
router.use(authenticateAdmin as RequestHandler);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     description: Retrieves statistics for the admin dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", getDashboard);

export default router; 