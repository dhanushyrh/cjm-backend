import { RequestHandler, Router } from "express";
import { fetchSettings, fetchSetting, updateSetting, removeSetting, createSetting, fetchSettingByKey } from "../controllers/settingsController";
import { authenticateAdmin, requirePermission } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticateAdmin as RequestHandler);

router.get("/", requirePermission("settings:read") as RequestHandler, fetchSettings);
router.post("/", requirePermission("settings:write") as RequestHandler, createSetting as RequestHandler);
router.get("/key/:key", requirePermission("settings:read") as RequestHandler, fetchSettingByKey as RequestHandler);
router.get("/:id", requirePermission("settings:read") as RequestHandler, fetchSetting as RequestHandler);
router.put("/:id", requirePermission("settings:write") as RequestHandler, updateSetting as RequestHandler);
router.delete("/:id", requirePermission("settings:write") as RequestHandler, removeSetting as RequestHandler);

export default router;
