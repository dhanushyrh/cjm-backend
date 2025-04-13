import { RequestHandler, Router } from "express";
import { fetchSettings, fetchSetting, updateSetting, removeSetting, createSetting, fetchSettingByKey } from "../controllers/settingsController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin as RequestHandler);

// Get all settings
router.get("/", fetchSettings);

// Create a new setting
router.post("/", createSetting as RequestHandler);

/**
 * @swagger
 * /api/settings/key/{key}:
 *   get:
 *     tags: [Settings]
 *     summary: Get a setting by key
 *     description: Retrieves a setting value by its key (e.g., point_value, join_bonus_point)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The setting key to retrieve
 *     responses:
 *       200:
 *         description: Setting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       example: point_value
 *                     value:
 *                       type: string
 *                       example: "0.1"
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */
// Get a setting by key
router.get("/key/:key", fetchSettingByKey as RequestHandler);

// Get a specific setting
router.get("/:id", fetchSetting as RequestHandler);

// Update a setting
router.put("/:id", updateSetting as RequestHandler);

// Delete a setting
router.delete("/:id", removeSetting as RequestHandler);

export default router; 