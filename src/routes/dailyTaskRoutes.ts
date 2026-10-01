import { Router, RequestHandler } from "express";
import * as dailyTaskController from "../controllers/dailyTaskController";
import { authenticateUser, authenticateAdmin, requirePermission } from "../middleware/authMiddleware";

const router = Router();

// User routes first (static paths)
router.get("/today", authenticateUser as RequestHandler, dailyTaskController.getTodayTasks as RequestHandler);
router.get(
  "/submissions/mine",
  authenticateUser as RequestHandler,
  dailyTaskController.getMySubmissions as RequestHandler
);

// Admin — submissions (before /:id)
router.get(
  "/admin/submissions",
  authenticateAdmin as RequestHandler,
  requirePermission("daily_tasks:read") as RequestHandler,
  dailyTaskController.listSubmissionsAdmin as RequestHandler
);
router.put(
  "/admin/submissions/:id",
  authenticateAdmin as RequestHandler,
  requirePermission("daily_tasks:update") as RequestHandler,
  dailyTaskController.reviewSubmission as RequestHandler
);

// Admin — tasks CRUD
router.post("/", authenticateAdmin as RequestHandler, requirePermission("daily_tasks:create") as RequestHandler, dailyTaskController.createDailyTask as RequestHandler);
router.get("/", authenticateAdmin as RequestHandler, requirePermission("daily_tasks:read") as RequestHandler, dailyTaskController.listDailyTasks as RequestHandler);
router.put("/:id", authenticateAdmin as RequestHandler, requirePermission("daily_tasks:update") as RequestHandler, dailyTaskController.updateDailyTask as RequestHandler);
router.delete("/:id", authenticateAdmin as RequestHandler, requirePermission("daily_tasks:delete") as RequestHandler, dailyTaskController.deleteDailyTask as RequestHandler);

// User submit
router.post(
  "/:id/submissions",
  authenticateUser as RequestHandler,
  dailyTaskController.submitTask as RequestHandler
);

export default router;
