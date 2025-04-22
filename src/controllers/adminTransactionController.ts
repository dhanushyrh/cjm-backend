import { Request, Response } from "express";
import { Op } from "sequelize";
import Transaction, { TransactionType } from "../models/Transaction";
import UserScheme from "../models/UserScheme";
import User from "../models/User";
import Scheme from "../models/Scheme";
import { createTransaction } from "../services/transactionService";
import sequelize from "../config/database";

/**
 * List all transactions with filters and pagination for admin
 * Filters can include:
 * - userId: Filter by user
 * - schemeId: Filter by scheme
 * - userSchemeId: Filter by specific user scheme
 * - transactionType: Filter by transaction type (deposit, withdrawal, points, bonus_withdrawal)
 * - startDate: Filter transactions from this date
 * - endDate: Filter transactions to this date
 * - minAmount: Filter transactions with amount >= minAmount
 * - maxAmount: Filter transactions with amount <= maxAmount
 * - sortBy: Field to sort by (createdAt, amount, goldGrams, points)
 * - sortOrder: asc or desc
 */
export const listAllTransactions = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        error: "Invalid page value",
        details: "Page must be greater than 0"
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid limit value",
        details: "Limit must be between 1 and 100"
      });
    }

    // Filters
    const filters: any = {
      is_deleted: false
    };

    // Transaction type filter
    if (req.query.transactionType) {
      filters.transactionType = req.query.transactionType;
    }

    // Date range filter
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate as string);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Invalid startDate format",
          details: "startDate must be a valid date"
        });
      }
      
      if (!filters.createdAt) {
        filters.createdAt = {};
      }
      filters.createdAt[Op.gte] = startDate;
    }

    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Invalid endDate format",
          details: "endDate must be a valid date"
        });
      }
      
      // Set to end of day
      endDate.setHours(23, 59, 59, 999);
      
      if (!filters.createdAt) {
        filters.createdAt = {};
      }
      filters.createdAt[Op.lte] = endDate;
    }

    // Amount range filter
    if (req.query.minAmount) {
      const minAmount = parseFloat(req.query.minAmount as string);
      if (isNaN(minAmount)) {
        return res.status(400).json({
          success: false,
          error: "Invalid minAmount",
          details: "minAmount must be a valid number"
        });
      }
      
      if (!filters.amount) {
        filters.amount = {};
      }
      filters.amount[Op.gte] = minAmount;
    }

    if (req.query.maxAmount) {
      const maxAmount = parseFloat(req.query.maxAmount as string);
      if (isNaN(maxAmount)) {
        return res.status(400).json({
          success: false,
          error: "Invalid maxAmount",
          details: "maxAmount must be a valid number"
        });
      }
      
      if (!filters.amount) {
        filters.amount = {};
      }
      filters.amount[Op.lte] = maxAmount;
    }

    // UserScheme filter
    if (req.query.userSchemeId) {
      filters.userSchemeId = req.query.userSchemeId;
    }

    // Sorting
    const validSortFields = ['createdAt', 'amount', 'goldGrams', 'points'];
    const sortBy = validSortFields.includes(req.query.sortBy as string) 
      ? req.query.sortBy 
      : 'createdAt';
    
    const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'asc'
      ? 'ASC'
      : 'DESC';

    // Query options
    const options: any = {
      where: filters,
      order: [[sortBy as string, sortOrder]],
      limit,
      offset,
      include: []
    };

    // Include UserScheme to filter by userId or schemeId if needed
    const userSchemeInclude: any = {
      model: UserScheme,
      as: 'userScheme',
      required: true,
      include: []
    };
    
    // Filter by User
    if (req.query.userId) {
      userSchemeInclude.where = {
        ...userSchemeInclude.where,
        userId: req.query.userId
      };
    }
    
    // Filter by Scheme
    if (req.query.schemeId) {
      userSchemeInclude.where = {
        ...userSchemeInclude.where,
        schemeId: req.query.schemeId
      };
    }
    
    // Add User and Scheme includes for detailed information
    userSchemeInclude.include.push({ 
      model: User, 
      as: 'user',
      attributes: ['id', 'name', 'email', 'mobile'] 
    });
    
    userSchemeInclude.include.push({ 
      model: Scheme, 
      as: 'scheme',
      attributes: ['id', 'name', 'duration', 'goldGrams'] 
    });
    
    options.include.push(userSchemeInclude);

    // Execute query with count
    const { count, rows } = await Transaction.findAndCountAll(options);

    // Format the transactions with related data
    const formattedTransactions = rows.map(transaction => {
      const plain = transaction.get({ plain: true });
      return {
        id: plain.id,
        userSchemeId: plain.userSchemeId,
        transactionType: plain.transactionType,
        amount: plain.amount,
        goldGrams: plain.goldGrams,
        points: plain.points,
        priceRefId: plain.priceRefId,
        redeemReqId: plain.redeemReqId,
        description: plain.description,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
        user: plain.userScheme?.user,
        scheme: plain.userScheme?.scheme,
        userSchemeDetails: {
          id: plain.userScheme?.id,
          status: plain.userScheme?.status,
          startDate: plain.userScheme?.startDate,
          endDate: plain.userScheme?.endDate
        }
      };
    });

    res.status(200).json({
      success: true,
      data: formattedTransactions,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error: any) {
    console.error("Admin Transactions List Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions"
    });
  }
};


/**
 * Create points transactions for all active user schemes
 * @param {number} points - Points to add to each active user scheme
 * @param {string} description - Description for the transaction
 */
export const createPointsTransactionsForAllActiveUsers = async (req: Request, res: Response) => {
  try {
    const { points, description } = req.body;

    // Validate input
    if (!points || typeof points !== 'number' || points <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid points value",
        details: "Points must be a positive number"
      });
    }

    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Invalid description",
        details: "Description is required and must be a string"
      });
    }

    // Get all active user schemes
    const activeUserSchemes = await UserScheme.findAll({
      where: {
        status: "ACTIVE",
        is_deleted: false
      }
    });

    if (activeUserSchemes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No active user schemes found"
      });
    }

    // Create a transaction for each active user scheme
    const transactions = [];
    const t = await sequelize.transaction();

    try {
      for (const userScheme of activeUserSchemes) {
        // Create transaction
        const transaction = await createTransaction({
          userSchemeId: userScheme.id,
          transactionType: "points",
          amount: 0,
          goldGrams: 0,
          points: points,
          description: description,
          transaction: t
        });

        // Update user scheme points
        await userScheme.update({
          totalPoints: userScheme.totalPoints + points,
          availablePoints: userScheme.availablePoints + points
        }, { transaction: t });

        transactions.push(transaction);
      }

      await t.commit();

      return res.status(201).json({
        success: true,
        message: `Created ${transactions.length} points transactions successfully`,
        data: {
          transactionCount: transactions.length,
          points: points,
          description: description
        }
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error creating points transactions:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create points transactions"
    });
  }
};