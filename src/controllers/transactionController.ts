import { Request, Response } from "express";
import { createTransaction, getUserTransactions, getTransactionsByScheme, deleteTransaction, getExportableTransactions, calculateExportSummary } from "../services/transactionService";
import { serializeTransaction, serializeTransactions } from "../serializers/transactionSerializer";
import {
  getUserSchemeTransactions,
  getUserSchemeTransactionSummary,
  getUserAllSchemesTransactions,
  getUserAllSchemesTransactionSummary
} from "../services/transactionService";
import { TransactionType } from "../models/Transaction";
import UserScheme from "../models/UserScheme";
import GoldPrice from "../models/GoldPrice";

// Add type declaration
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      [key: string]: any;
    };
  }
}

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { userId, schemeId, transactionType, goldGrams, points } = req.body;

    // Validate required fields
    if (!userId || !schemeId || !transactionType || !goldGrams || !points) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          userId: !userId ? "User ID is required" : undefined,
          schemeId: !schemeId ? "Scheme ID is required" : undefined,
          transactionType: !transactionType ? "Transaction type is required" : undefined,
          goldGrams: !goldGrams ? "Gold grams is required" : undefined,
          points: !points ? "Points are required" : undefined
        }
      });
    }

    // Validate numeric fields
    if (goldGrams <= 0 || points <= 0) {
      return res.status(400).json({ 
        error: "Invalid values",
        details: "Gold grams and points must be greater than 0"
      });
    }

    // Get current gold price
    const currentGoldPrice = await GoldPrice.findOne({
      where: { is_deleted: false },
      order: [['date', 'DESC']]
    });

    if (!currentGoldPrice) {
      return res.status(400).json({
        error: "Configuration Error",
        details: "Current gold price not found"
      });
    }

    // Calculate amount based on gold price and grams
    const amount = Number(currentGoldPrice.pricePerGram) * Number(goldGrams);

    // Get or validate userScheme
    const userScheme = await UserScheme.findOne({
      where: { userId, schemeId, status: 'ACTIVE' }
    });

    if (!userScheme) {
      return res.status(400).json({
        error: "Invalid Reference",
        details: "No active scheme found for this user"
      });
    }

    const newTransaction = await createTransaction({
      userSchemeId: userScheme.id,
      transactionType,
      amount,
      goldGrams,
      points
    });
    const serializedTransaction = serializeTransaction(newTransaction);

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: serializedTransaction,
      calculatedAmount: amount,
      goldPrice: currentGoldPrice.pricePerGram
    });
  } catch (error: any) {
    console.error("Transaction Creation Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ 
        error: "Invalid Reference",
        details: "User or Scheme not found"
      });
    }

    res.status(500).json({ error: "Failed to create transaction" });
  }
};

export const fetchUserTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing user ID",
        details: "User ID is required"
      });
    }
    
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

    const result = await getUserTransactions(userId, page, limit);
    const serializedTransactions = serializeTransactions(result.data);

    res.status(200).json({
      success: true,
      data: serializedTransactions,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error("User Transactions Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ 
      success: false,
      error: "Failed to fetch user transactions" 
    });
  }
};

export const fetchSchemeTransactions = async (req: Request, res: Response) => {
  try {
    const { schemeId } = req.params;
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!schemeId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing scheme ID",
        details: "Scheme ID is required"
      });
    }
    
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

    const result = await getTransactionsByScheme(schemeId, page, limit);
    const serializedTransactions = serializeTransactions(result.data);

    res.status(200).json({
      success: true,
      data: serializedTransactions,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error("Scheme Transactions Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ 
      success: false,
      error: "Failed to fetch scheme transactions" 
    });
  }
};

export const removeTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: "Missing transaction ID",
        details: "Transaction ID is required"
      });
    }

    const deleted = await deleteTransaction(id);
    if (!deleted) {
      return res.status(404).json({ 
        error: "Transaction not found",
        details: "No transaction found with the provided ID"
      });
    }

    res.status(200).json({ 
      message: "Transaction deleted successfully",
      transactionId: id
    });
  } catch (error: any) {
    console.error("Transaction Delete Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to delete transaction" });
  }
};

// Get transactions for a specific user scheme
export const getSchemeTransactions = async (req: Request, res: Response) => {
  try {
    const { userSchemeId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as TransactionType | undefined;

    const { transactions, total } = await getUserSchemeTransactions(userSchemeId, page, limit, type);

    res.status(200).json({
      message: "Transactions retrieved successfully",
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get Scheme Transactions Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });
    res.status(500).json({ error: "Failed to retrieve transactions" });
  }
};

// Get transaction summary for a specific user scheme
export const getSchemeTransactionSummary = async (req: Request, res: Response) => {
  try {
    const { userSchemeId } = req.params;
    const summary = await getUserSchemeTransactionSummary(userSchemeId);

    res.status(200).json({
      message: "Transaction summary retrieved successfully",
      data: summary
    });
  } catch (error: any) {
    console.error("Get Scheme Transaction Summary Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });
    res.status(500).json({ error: "Failed to retrieve transaction summary" });
  }
};

// Get all transactions for a user across all schemes
export const getAllUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming user ID is set by auth middleware
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { transactions, total } = await getUserAllSchemesTransactions(userId, page, limit);

    res.status(200).json({
      message: "Transactions retrieved successfully",
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get All User Transactions Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });
    res.status(500).json({ error: "Failed to retrieve transactions" });
  }
};

// Get transaction summary for all user schemes
export const getAllUserTransactionSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming user ID is set by auth middleware
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const summary = await getUserAllSchemesTransactionSummary(userId);

    res.status(200).json({
      message: "Transaction summary retrieved successfully",
      data: summary
    });
  } catch (error: any) {
    console.error("Get All User Transaction Summary Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });
    res.status(500).json({ error: "Failed to retrieve transaction summary" });
  }
};

export const exportTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { userSchemeId, startDate, endDate } = req.query;
    
    // Validate dates if provided
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ error: "Invalid start date format" });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ error: "Invalid end date format" });
      }
    }

    const transactions = await getExportableTransactions(
      userId,
      userSchemeId as string | undefined,
      parsedStartDate,
      parsedEndDate
    );

    // Calculate summary
    const summary = calculateExportSummary(transactions);

    // Generate CSV header
    const csvHeader = [
      "Transaction ID",
      "Date",
      "Type",
      "Amount",
      "Gold Grams",
      "Points",
      "User Name",
      "Scheme Name",
      "User Scheme ID"
    ].join(",");

    // Generate CSV rows
    const csvRows = transactions.map(t => [
      t.transactionId,
      t.date,
      t.type,
      t.amount,
      t.goldGrams,
      t.points,
      `"${t.userName}"`,
      `"${t.schemeName}"`,
      t.userSchemeId
    ].join(","));

    // Generate summary rows
    const summaryRows = [
      "", // Empty row for spacing
      "SUMMARY",
      "Overall Summary",
      `Total Transactions,${summary.transactionCounts.total}`,
      `Deposits,${summary.transactionCounts.deposits}`,
      `Withdrawals,${summary.transactionCounts.withdrawals}`,
      `Points Transactions,${summary.transactionCounts.points}`,
      `Total Amount,${summary.totalAmount}`,
      `Total Gold Grams,${summary.totalGoldGrams}`,
      `Total Points,${summary.totalPoints}`,
      "", // Empty row for spacing
      "SCHEME-WISE SUMMARY"
    ];

    // Add scheme-wise summaries
    Object.entries(summary.schemeWiseSummary).forEach(([schemeId, schemeSummary]) => {
      summaryRows.push(
        `Scheme: ${schemeSummary.schemeName}`,
        `Total Transactions,${schemeSummary.transactionCount}`,
        `Total Amount,${schemeSummary.totalAmount}`,
        `Total Gold Grams,${schemeSummary.totalGoldGrams}`,
        `Total Points,${schemeSummary.totalPoints}`,
        "" // Empty row for spacing
      );
    });

    // Combine all rows
    const csv = [
      csvHeader,
      ...csvRows,
      ...summaryRows
    ].join("\n");

    // Set response headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions-${new Date().toISOString().split("T")[0]}.csv`
    );

    res.send(csv);
  } catch (error: any) {
    console.error("Transaction Export Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });
    res.status(500).json({ error: "Failed to export transactions" });
  }
};
