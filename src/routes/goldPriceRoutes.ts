import express, { RequestHandler } from "express";
import { setGoldPrice, getGoldPrices, getGoldPriceGraph, getCurrentGoldPrice } from "../controllers/goldPriceController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     GoldPrice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         pricePerGram:
 *           type: number
 *           description: Gold price per gram in rupees
 *         date:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 *     GoldPriceGraph:
 *       type: object
 *       properties:
 *         graphData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               price:
 *                 type: number
 *         statistics:
 *           type: object
 *           properties:
 *             currentPrice:
 *               type: number
 *             averagePrice:
 *               type: number
 *             minPrice:
 *               type: number
 *             maxPrice:
 *               type: number
 *             priceChange:
 *               type: number
 *             percentageChange:
 *               type: number
 */

/**
 * @swagger
 * /api/gold-prices/graph:
 *   get:
 *     tags: [Gold Price]
 *     summary: Get gold price graph data
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of days of price history to retrieve
 *     responses:
 *       200:
 *         description: Gold price graph data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GoldPriceGraph'
 *       400:
 *         description: Invalid days parameter
 */
router.get("/graph", (getGoldPriceGraph as unknown) as RequestHandler);

/**
 * @swagger
 * /api/gold-prices:
 *   post:
 *     tags: [Gold Price]
 *     summary: Set new gold price
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pricePerGram
 *             properties:
 *               pricePerGram:
 *                 type: number
 *                 description: New gold price per gram in rupees
 *     responses:
 *       200:
 *         description: Gold price set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GoldPrice'
 *       400:
 *         description: Invalid price value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not an admin
 */
router.post("/", authenticateAdmin as RequestHandler, (setGoldPrice as unknown) as RequestHandler);

/**
 * @swagger
 * /api/gold-price/current:
 *   get:
 *     tags: [Gold Price]
 *     summary: Get current gold price
 *     description: Retrieves the latest active gold price
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current gold price retrieved successfully
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
 *                     date:
 *                       type: string
 *                       format: date
 *                     pricePerGram:
 *                       type: number
 *                       format: float
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: No active gold price found
 *       401:
 *         description: Unauthorized
 */
router.get("/current", getCurrentGoldPrice as RequestHandler);

/**
 * @swagger
 * /api/gold-prices:
 *   get:
 *     tags: [Gold Price]
 *     summary: Get gold price history with pagination
 *     description: Retrieves a paginated list of gold prices in descending order by date
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
 *         description: Number of prices per page
 *     responses:
 *       200:
 *         description: Gold price history retrieved successfully
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
 *                       date:
 *                         type: string
 *                         format: date
 *                       pricePerGram:
 *                         type: number
 *                         format: float
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
 *                       description: Total number of gold prices
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of gold prices per page
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       400:
 *         description: Bad request - Invalid pagination parameters
 */
router.get("/", getGoldPrices as RequestHandler);

export default router; 