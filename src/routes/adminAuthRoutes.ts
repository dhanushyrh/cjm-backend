import express, { Router, RequestHandler } from "express";
import { registerAdmin, loginAdmin, registerUser } from "../controllers/adminAuthController";
import { authenticateAdmin } from "../middleware/adminAuthMiddleware";
import { AdminRequest } from "../middleware/adminAuthMiddleware";
import { fetchUsers } from "../controllers/userController";
import { assignScheme, removeUser } from "../controllers/userController";
import { addScheme, fetchSchemes, fetchSchemeById, modifyScheme, removeScheme } from "../controllers/schemeController";
import { addTransaction, fetchUserTransactions, fetchSchemeTransactions, removeTransaction } from "../controllers/transactionController";
const router: Router = express.Router();

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     tags: [Admin Authentication]
 *     summary: Register a new admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/register", registerAdmin as RequestHandler);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     tags: [Admin Authentication]
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginAdmin as RequestHandler);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Access admin dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard accessed successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", authenticateAdmin as RequestHandler, (req: AdminRequest, res) => {
    res.json({ message: "Admin Dashboard Accessed", admin: req.admin });
});

// User Management
/**
 * @swagger
 * /api/admin/user/register:
 *   post:
 *     tags: [User Management]
 *     summary: Register a new user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - nominee
 *               - relation
 *               - mobile
 *               - address
 *               - dob
 *               - schemeId
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               nominee:
 *                 type: string
 *               relation:
 *                 type: string
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               schemeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post("/user/register", authenticateAdmin as RequestHandler, registerUser as RequestHandler);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [User Management]
 *     summary: Get all users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/users", authenticateAdmin as RequestHandler, fetchUsers);

/**
 * @swagger
 * /api/admin/assign-scheme:
 *   post:
 *     tags: [User Management]
 *     summary: Assign scheme to user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - schemeId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               schemeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Scheme assigned successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post("/assign-scheme", authenticateAdmin as RequestHandler, assignScheme as RequestHandler);

/**
 * @swagger
 * /api/admin/user/{userId}:
 *   delete:
 *     tags: [User Management]
 *     summary: Remove a user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete("/user/:userId", authenticateAdmin as RequestHandler, removeUser as RequestHandler);

// Scheme Management
/**
 * @swagger
 * /api/admin/scheme:
 *   post:
 *     tags: [Scheme Management]
 *     summary: Create a new scheme
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - duration
 *               - goldGrams
 *               - monthlyAmount
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *               goldGrams:
 *                 type: number
 *                 minimum: 0.1
 *               monthlyAmount:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Scheme created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/scheme", authenticateAdmin as RequestHandler, addScheme as RequestHandler);

/**
 * @swagger
 * /api/admin/schemes:
 *   get:
 *     tags: [Scheme Management]
 *     summary: Get all schemes with pagination
 *     description: Retrieves a paginated list of all schemes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of schemes per page
 *     responses:
 *       200:
 *         description: List of schemes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       duration:
 *                         type: integer
 *                       goldGrams:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of schemes
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of schemes per page
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       400:
 *         description: Bad request - Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/schemes", authenticateAdmin as RequestHandler, fetchSchemes as RequestHandler);

/**
 * @swagger
 * /api/admin/scheme/{id}:
 *   get:
 *     tags: [Scheme Management]
 *     summary: Get scheme by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Scheme retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheme not found
 *   put:
 *     tags: [Scheme Management]
 *     summary: Update a scheme
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               goldGrams:
 *                 type: number
 *               monthlyAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Scheme updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheme not found
 *   delete:
 *     tags: [Scheme Management]
 *     summary: Delete a scheme
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Scheme deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheme not found
 */
router.get("/scheme/:id", authenticateAdmin as RequestHandler, fetchSchemeById as RequestHandler);
router.put("/scheme/:id", authenticateAdmin as RequestHandler, modifyScheme as RequestHandler);
router.delete("/scheme/:id", authenticateAdmin as RequestHandler, removeScheme as RequestHandler);

// Transaction Management
/**
 * @swagger
 * /api/admin/transaction:
 *   post:
 *     tags: [Transaction Management]
 *     summary: Create a new transaction
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userSchemeId
 *               - type
 *               - amount
 *             properties:
 *               userSchemeId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [DEPOSIT, WITHDRAWAL, BONUS]
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               goldGrams:
 *                 type: number
 *                 minimum: 0
 *               points:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/transaction", authenticateAdmin as RequestHandler, addTransaction as RequestHandler);

/**
 * @swagger
 * /api/admin/transactions/{userId}:
 *   get:
 *     tags: [Transaction Management]
 *     summary: Get user transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/transactions/:userId", authenticateAdmin as RequestHandler, fetchUserTransactions as RequestHandler);

/**
 * @swagger
 * /api/admin/transactions/{schemeId}:
 *   get:
 *     tags: [Transaction Management]
 *     summary: Get scheme transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Scheme transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/transactions/:schemeId", authenticateAdmin as RequestHandler, fetchSchemeTransactions as RequestHandler);

/**
 * @swagger
 * /api/admin/transaction/{id}:
 *   delete:
 *     tags: [Transaction Management]
 *     summary: Delete a transaction
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.delete("/transaction/:id", authenticateAdmin as RequestHandler, removeTransaction as RequestHandler);

export default router;
