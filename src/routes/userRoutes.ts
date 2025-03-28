import express, { RequestHandler, Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { AuthRequest } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.get("/profile", authenticateUser as RequestHandler, (req: AuthRequest, res) => {
  res.json({ message: "Profile accessed!", user: req.user });
});

export default router;
