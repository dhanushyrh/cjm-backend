import { Request, Response } from "express";
import { createTransaction, getUserTransactions, getTransactionsByScheme, deleteTransaction } from "../services/transactionService";
import { serializeTransaction, serializeTransactions } from "../serializers/transactionSerializer";

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { userId, schemeId, transactionType, amount, goldGrams, points } = req.body;

    // Validate required fields
    if (!userId || !schemeId || !transactionType || !amount || !goldGrams || !points) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          userId: !userId ? "User ID is required" : undefined,
          schemeId: !schemeId ? "Scheme ID is required" : undefined,
          transactionType: !transactionType ? "Transaction type is required" : undefined,
          amount: !amount ? "Amount is required" : undefined,
          goldGrams: !goldGrams ? "Gold grams is required" : undefined,
          points: !points ? "Points are required" : undefined
        }
      });
    }

    // Validate numeric fields
    if (amount <= 0 || goldGrams <= 0 || points <= 0) {
      return res.status(400).json({ 
        error: "Invalid values",
        details: "Amount, gold grams, and points must be greater than 0"
      });
    }

    const newTransaction = await createTransaction(userId, schemeId, transactionType, amount, goldGrams, points);
    const serializedTransaction = serializeTransaction(newTransaction);

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: serializedTransaction
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

    if (!userId) {
      return res.status(400).json({ 
        error: "Missing user ID",
        details: "User ID is required"
      });
    }

    const transactions = await getUserTransactions(userId);
    const serializedTransactions = serializeTransactions(transactions);

    res.status(200).json({
      message: "User transactions fetched successfully",
      data: serializedTransactions
    });
  } catch (error: any) {
    console.error("User Transactions Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch user transactions" });
  }
};

export const fetchSchemeTransactions = async (req: Request, res: Response) => {
  try {
    const { schemeId } = req.params;

    if (!schemeId) {
      return res.status(400).json({ 
        error: "Missing scheme ID",
        details: "Scheme ID is required"
      });
    }

    const transactions = await getTransactionsByScheme(schemeId);
    const serializedTransactions = serializeTransactions(transactions);

    res.status(200).json({
      message: "Scheme transactions fetched successfully",
      data: serializedTransactions
    });
  } catch (error: any) {
    console.error("Scheme Transactions Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch scheme transactions" });
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
