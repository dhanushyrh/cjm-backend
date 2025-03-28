import express, { Router, RequestHandler } from "express";
import { loginUser } from "../controllers/authController";

const router: Router = express.Router();

router.post("/login", loginUser as RequestHandler);

export default router;
