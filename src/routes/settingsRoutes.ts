import { RequestHandler, Router } from "express";
import { fetchSettings, fetchSetting, updateSetting, removeSetting, createSetting } from "../controllers/settingsController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin as RequestHandler);

// Get all settings
router.get("/", fetchSettings);

// Create a new setting
router.post("/", createSetting as RequestHandler);

// Get a specific setting
router.get("/:id", fetchSetting as RequestHandler);

// Update a setting
router.put("/:id", updateSetting as RequestHandler);

// Delete a setting
router.delete("/:id", removeSetting as RequestHandler);

export default router; 