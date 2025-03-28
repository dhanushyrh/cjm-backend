import express, { Router, RequestHandler } from "express";
import { registerAdmin, loginAdmin, registerUser } from "../controllers/adminAuthController";
import { authenticateAdmin } from "../middleware/adminAuthMiddleware";
import { AdminRequest } from "../middleware/adminAuthMiddleware";
import { fetchUsers } from "../controllers/userController";
import { assignScheme, removeUser } from "../controllers/userController";
import { addScheme, fetchSchemes, fetchSchemeById, modifyScheme, removeScheme } from "../controllers/schemeController";
import { addTransaction, fetchUserTransactions, fetchSchemeTransactions, removeTransaction } from "../controllers/transactionController";
const router: Router = express.Router();

router.post("/register", registerAdmin as RequestHandler);
router.post("/login", loginAdmin as RequestHandler);
router.get("/dashboard", authenticateAdmin as RequestHandler, (req: AdminRequest, res) => {
    res.json({ message: "Admin Dashboard Accessed", admin: req.admin });
});

// User Management
router.post("/user/register", authenticateAdmin as RequestHandler, registerUser as RequestHandler);
router.get("/users", authenticateAdmin as RequestHandler, fetchUsers);
router.post("/assign-scheme", authenticateAdmin as RequestHandler, assignScheme as RequestHandler);
router.delete("/user/:userId", authenticateAdmin as RequestHandler, removeUser as RequestHandler);

// Scheme Management
router.post("/scheme", authenticateAdmin as RequestHandler, addScheme as RequestHandler);
router.get("/schemes", authenticateAdmin as RequestHandler, fetchSchemes as RequestHandler);
router.get("/scheme/:id", authenticateAdmin as RequestHandler, fetchSchemeById as RequestHandler);
router.put("/scheme/:id", authenticateAdmin as RequestHandler, modifyScheme as RequestHandler);
router.delete("/scheme/:id", authenticateAdmin as RequestHandler, removeScheme as RequestHandler);

// Transaction Management
router.post("/transaction", authenticateAdmin as RequestHandler, addTransaction as RequestHandler);
router.get("/transactions/:userId", authenticateAdmin as RequestHandler, fetchUserTransactions as RequestHandler);
router.get("/transactions/:schemeId", authenticateAdmin as RequestHandler, fetchSchemeTransactions as RequestHandler);
router.delete("/transaction/:id", authenticateAdmin as RequestHandler, removeTransaction as RequestHandler);

export default router;
