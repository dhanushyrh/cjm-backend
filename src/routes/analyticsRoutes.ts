import express, { RequestHandler } from 'express';
import { getAnalyticsData } from '../controllers/analyticsController';
import { authenticateAdmin } from '../middleware/adminAuthMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Get comprehensive analytics data
 *     description: Retrieves consolidated analytics data across users, schemes, transactions, and redemptions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
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
 *                           type: integer
 *                           example: 125
 *                         activeUsers:
 *                           type: integer
 *                           example: 98
 *                         usersByStatus:
 *                           type: object
 *                           properties:
 *                             active:
 *                               type: integer
 *                               example: 98
 *                             inactive:
 *                               type: integer
 *                               example: 27
 *                     schemeStats:
 *                       type: object
 *                       properties:
 *                         totalSchemes:
 *                           type: integer
 *                           example: 5
 *                         activeSchemes:
 *                           type: integer
 *                           example: 4
 *                     userSchemeStats:
 *                       type: object
 *                       properties:
 *                         totalUserSchemes:
 *                           type: integer
 *                           example: 210
 *                         activeUserSchemes:
 *                           type: integer
 *                           example: 180
 *                         completedUserSchemes:
 *                           type: integer
 *                           example: 25
 *                         withdrawnUserSchemes:
 *                           type: integer
 *                           example: 5
 *                         userSchemesByStatus:
 *                           type: object
 *                           properties:
 *                             ACTIVE:
 *                               type: integer
 *                               example: 180
 *                             COMPLETED:
 *                               type: integer
 *                               example: 25
 *                             WITHDRAWN:
 *                               type: integer
 *                               example: 5
 *                     transactionStats:
 *                       type: object
 *                       properties:
 *                         totalTransactions:
 *                           type: integer
 *                           example: 450
 *                         totalDeposits:
 *                           type: number
 *                           example: 2500000
 *                         totalWithdrawals:
 *                           type: number
 *                           example: 500000
 *                         totalAmount:
 *                           type: number
 *                           example: 3000000
 *                         totalGoldGrams:
 *                           type: number
 *                           example: 350.75
 *                         totalPoints:
 *                           type: integer
 *                           example: 8750
 *                         transactionsByType:
 *                           type: object
 *                           properties:
 *                             deposit:
 *                               type: integer
 *                               example: 280
 *                             withdrawal:
 *                               type: integer
 *                               example: 85
 *                             points:
 *                               type: integer
 *                               example: 65
 *                             bonus_withdrawal:
 *                               type: integer
 *                               example: 20
 *                     goldStats:
 *                       type: object
 *                       properties:
 *                         currentGoldPrice:
 *                           type: number
 *                           example: 9400
 *                         lastUpdated:
 *                           type: string
 *                           format: date
 *                           example: "2023-06-15"
 *                     redemptionStats:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: integer
 *                           example: 75
 *                         pendingRequests:
 *                           type: integer
 *                           example: 12
 *                         approvedRequests:
 *                           type: integer
 *                           example: 58
 *                         rejectedRequests:
 *                           type: integer
 *                           example: 5
 *                         totalPointsRedeemed:
 *                           type: integer
 *                           example: 4200
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', authenticateAdmin as RequestHandler, getAnalyticsData as RequestHandler);

export default router; 