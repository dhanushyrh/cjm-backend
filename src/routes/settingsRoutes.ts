import { RequestHandler, Router } from "express";
import { fetchSettings, fetchSetting, updateSetting, removeSetting } from "../controllers/settingsController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin as RequestHandler);

// Get all settings
router.get("/", fetchSettings);

// Get a specific setting
router.get("/:key", fetchSetting as RequestHandler);

// Update a setting
router.put("/:key", updateSetting  as RequestHandler);

// Delete a setting
router.delete("/:key", removeSetting as RequestHandler);

export default router; 