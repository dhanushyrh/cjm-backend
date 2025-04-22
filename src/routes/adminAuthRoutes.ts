import express, { Router, RequestHandler } from "express";
import { registerAdmin, loginAdmin, registerUser } from "../controllers/adminAuthController";
import { fetchUsers, updateUserStatus, searchUserByUserId, fetchUserById, updateUserDetailsController } from "../controllers/userController";
import { removeUser } from "../controllers/userController";
import { addScheme, fetchSchemes, fetchSchemeById, modifyScheme, removeScheme } from "../controllers/schemeController";
import { 
  addTransaction, 
  fetchUserTransactions, 
  fetchSchemeTransactions, 
  removeTransaction,
  getSchemeTransactionSummary,
  fetchUserSchemeTransactions
} from "../controllers/transactionController";
import { updateCertificateDeliveryStatus } from "../controllers/userSchemeController";
import { getDashboardStats } from "../services/dashboardService";
import { triggerGoldAccrual } from "../controllers/adminRedemptionController";
import { AdminRequest, authenticateAdmin } from "../middleware/authMiddleware";
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
 *     summary: Get comprehensive dashboard statistics
 *     description: Retrieves comprehensive dashboard statistics including user, scheme, transaction, and redemption data.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                     userStats:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                         activeUsers:
 *                           type: number
 *                     goldPrice:
 *                       type: object
 *                       properties:
 *                         currentPrice:
 *                           type: number
 *                         lastUpdated:
 *                           type: string
 *                           format: date
 *                         priceHistory:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               price:
 *                                 type: number
 *                     schemeStats:
 *                       type: object
 *                       properties:
 *                         totalSchemes:
 *                           type: number
 *                         activeSchemes:
 *                           type: number
 *                         schemeDistribution:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               count:
 *                                 type: number
 *                     userSchemeStats:
 *                       type: object
 *                       properties:
 *                         totalUserSchemes:
 *                           type: number
 *                         activeUserSchemes:
 *                           type: number
 *                         completedUserSchemes:
 *                           type: number
 *                         withdrawnUserSchemes:
 *                           type: number
 *                     transactionStats:
 *                       type: object
 *                       properties:
 *                         totalTransactions:
 *                           type: number
 *                         totalDeposits:
 *                           type: number
 *                         totalWithdrawals:
 *                           type: number
 *                         totalAmount:
 *                           type: number
 *                         totalGoldGrams:
 *                           type: number
 *                         totalPoints:
 *                           type: number
 *                         transactionsByType:
 *                           type: object
 *                     redemptionStats:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: number
 *                         pendingRequests:
 *                           type: number
 *                         approvedRequests:
 *                           type: number
 *                         rejectedRequests:
 *                           type: number
 *                         totalPointsRedeemed:
 *                           type: number
 *                     nearingMaturitySchemes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           daysLeft:
 *                             type: number
 *                           endDate:
 *                             type: string
 *                             format: date
 *                           status:
 *                             type: string
 *                           goldGrams:
 *                             type: string
 *                           duration:
 *                             type: number
 *                           startDate:
 *                             type: string
 *                             format: date
 *                           availablePoints:
 *                             type: number
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           scheme:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           transactionType:
 *                             type: string
 *                           amount:
 *                             type: string
 *                           goldGrams:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/dashboard", authenticateAdmin as RequestHandler, async (req: AdminRequest, res) => {
    try {
        const dashboardStats = await getDashboardStats();
        res.json({ 
            success: true, 
            data: dashboardStats
        });
    } catch (error: any) {
        console.error("Dashboard Error:", {
            message: error.message,
            stack: error.stack,
            details: error.errors || error
        });
        
        res.status(500).json({ 
            success: false, 
            error: "Failed to retrieve dashboard data", 
            message: error.message 
        });
    }
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
 *               - current_address
 *               - permanent_address
 *               - dob
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
 *               current_address:
 *                 type: string
 *               permanent_address:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               receive_posts:
 *                 type: boolean
 *                 default: false
 *               profile_image:
 *                 type: string
 *                 description: URL to user's profile image on S3
 *               id_proof:
 *                 type: string
 *                 description: URL to user's ID proof document on S3
 *               referred_by:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the user who referred this user
 *               schemeId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional scheme ID. If not provided, user will be created without a scheme.
 *               desired_item:
 *                 type: string
 *                 description: The specific gold item the user wants to purchase (only applicable if schemeId is provided)
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
 *     summary: Get all users with pagination
 *     description: Retrieves a paginated list of all users
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
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                       userId:
 *                         type: string
 *                         description: Unique user identifier in format HS-XXXXXX
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       mobile:
 *                         type: string
 *                       current_address:
 *                         type: string
 *                       permanent_address:
 *                         type: string
 *                       nominee:
 *                         type: string
 *                       relation:
 *                         type: string
 *                       receive_posts:
 *                         type: boolean
 *                       profile_image:
 *                         type: string
 *                       id_proof:
 *                         type: string
 *                       referred_by:
 *                         type: string
 *                       dob:
 *                         type: string
 *                         format: date
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       scheme:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of users
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of users per page
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       400:
 *         description: Bad request - Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/users", authenticateAdmin as RequestHandler, fetchUsers as RequestHandler);

/**
 * @swagger
 * /api/admin/user/{userId}:
 *   get:
 *     tags: [User Management]
 *     summary: Get a user by ID
 *     description: Retrieves a user by their UUID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The user's UUID
 *     responses:
 *       200:
 *         description: User found successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       example: "HS-123456"
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     schemes:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", authenticateAdmin as RequestHandler, fetchUserById as RequestHandler);

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

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   patch:
 *     tags: [User Management]
 *     summary: Update user active status
 *     description: Activates or deactivates a user by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The user's UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: The new active status for the user
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch("/users/:userId/status", authenticateAdmin as RequestHandler, updateUserStatus as RequestHandler);

/**
 * @swagger
 * /api/admin/users/search/{userId}:
 *   get:
 *     tags: [User Management]
 *     summary: Search for a user by userId
 *     description: Retrieves a user by their unique userId in HS-XXXXXX format
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           pattern: '^HS-\d{6}$'
 *         required: true
 *         description: The unique user ID in HS-XXXXXX format
 *     responses:
 *       200:
 *         description: User found successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       example: "HS-123456"
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     current_address:
 *                       type: string
 *                     permanent_address:
 *                       type: string
 *                     nominee:
 *                       type: string
 *                     relation:
 *                       type: string
 *                     receive_posts:
 *                       type: boolean
 *                     profile_image:
 *                       type: string
 *                     id_proof:
 *                       type: string
 *                     referred_by:
 *                       type: string
 *                       format: uuid
 *                     referrer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         userId:
 *                           type: string
 *                         name:
 *                           type: string
 *                     dob:
 *                       type: string
 *                       format: date
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     schemes:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request - Invalid or missing parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/users/search/:userId", authenticateAdmin as RequestHandler, searchUserByUserId as RequestHandler);

/**
 * @swagger
 * /api/admin/user/{userId}:
 *   put:
 *     tags: [User Management]
 *     summary: Update user details
 *     description: Update user's mobile, DOB, addresses, nominee and relation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The user's UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *                 description: User's mobile number
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth (YYYY-MM-DD)
 *               current_address:
 *                 type: string
 *                 description: User's current address
 *               permanent_address:
 *                 type: string
 *                 description: User's permanent address
 *               nominee:
 *                 type: string
 *                 description: User's nominee name
 *               relation:
 *                 type: string
 *                 description: User's relation with nominee
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User details updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     nominee:
 *                       type: string
 *                     relation:
 *                       type: string
 *                     current_address:
 *                       type: string
 *                     permanent_address:
 *                       type: string
 *                     dob:
 *                       type: string
 *                       format: date
 *       400:
 *         description: Bad request - Invalid input or no fields to update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/user/:userId", authenticateAdmin as RequestHandler, updateUserDetailsController as RequestHandler);

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
router.get('/accrued-gold', authenticateAdmin as RequestHandler, (triggerGoldAccrual as unknown) as RequestHandler);
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
 *     summary: Get user transactions with pagination
 *     description: Retrieves a paginated list of all transactions for a specific user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: User transactions retrieved successfully
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
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of transactions
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of transactions per page
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       400:
 *         description: Bad request - Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/transactions/:userId", authenticateAdmin as RequestHandler, fetchUserTransactions as RequestHandler);

/**
 * @swagger
 * /api/admin/transactions/{schemeId}:
 *   get:
 *     tags: [Transaction Management]
 *     summary: Get scheme transactions with pagination
 *     description: Retrieves a paginated list of all transactions for a specific scheme
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: Scheme transactions retrieved successfully
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
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of transactions
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of transactions per page
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       400:
 *         description: Bad request - Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/transactions/:schemeId", authenticateAdmin as RequestHandler, fetchSchemeTransactions as RequestHandler);

/**
 * @swagger
 * /api/admin/userScheme/transactions/{userSchemeId}:
 *   get:
 *     tags: [Transaction Management]
 *     summary: Get transactions for a specific user scheme with pagination
 *     description: Retrieves a paginated list of all transactions for a specific user scheme
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user scheme to get transactions for
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
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: User scheme transactions retrieved successfully
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
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of transactions
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of transactions per page
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       400:
 *         description: Bad request - Invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User scheme not found
 */
router.get("/userScheme/transactions/:userSchemeId", authenticateAdmin as RequestHandler, fetchUserSchemeTransactions as RequestHandler);

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

/**
 * @swagger
 * /api/admin/userScheme/{userSchemeId}/summary:
 *   get:
 *     tags: [Transaction Management]
 *     summary: Get transaction summary for a specific user scheme
 *     description: Retrieves a summary of all transactions for a specific user scheme
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user scheme to get summary for
 *     responses:
 *       200:
 *         description: Transaction summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaction summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDeposits:
 *                       type: number
 *                       example: 25000
 *                     totalWithdrawals:
 *                       type: number
 *                       example: 5000
 *                     netAmount:
 *                       type: number
 *                       example: 20000
 *                     totalGoldGrams:
 *                       type: number
 *                       example: 10.5
 *                     totalPoints:
 *                       type: number
 *                       example: 100
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/userScheme/:userSchemeId/summary", authenticateAdmin as RequestHandler, getSchemeTransactionSummary as RequestHandler);

/**
 * @swagger
 * /api/admin/userScheme/{userSchemeId}/certificate:
 *   patch:
 *     tags: [User Scheme Management]
 *     summary: Update certificate delivery status
 *     description: Mark a certificate as delivered or not delivered
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userSchemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user scheme to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certificate_delivered
 *             properties:
 *               certificate_delivered:
 *                 type: boolean
 *                 description: Whether the certificate has been delivered
 *     responses:
 *       200:
 *         description: Certificate delivery status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Certificate marked as delivered
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User scheme not found
 *       500:
 *         description: Server error
 */
router.patch("/userScheme/:userSchemeId/certificate", authenticateAdmin as RequestHandler, updateCertificateDeliveryStatus as RequestHandler);

export default router;
