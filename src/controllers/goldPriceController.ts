import { Request, Response } from "express";
import { Transaction } from "sequelize";
import sequelize from "../config/database";
import GoldPrice from "../models/GoldPrice";
import { goldPriceEmitter } from "../events/goldPriceEvents";
import { getLastNDaysGoldPrices, getPaginatedGoldPrices } from "../services/goldPriceService";
import { softDeleteBonusTransactions } from "../services/goldPriceBonusService";

// Add or update daily gold price
export const setGoldPrice = async (req: Request, res: Response) => {
  try {
    const { date, pricePerGram } = req.body;

    // Validate required fields
    if (!date || !pricePerGram) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          date: !date ? "Date is required" : undefined,
          pricePerGram: !pricePerGram ? "Price per gram is required" : undefined
        }
      });
    }

    // Validate price is positive
    if (pricePerGram <= 0) {
      return res.status(400).json({ 
        error: "Invalid price",
        details: "Price per gram must be greater than 0"
      });
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ 
        error: "Invalid date format",
        details: "Please provide date in YYYY-MM-DD format"
      });
    }

    const formattedDate = parsedDate.toISOString().split('T')[0];

    // Use transaction to ensure data consistency
    const result = await sequelize.transaction(async (t: Transaction) => {
      // Find existing price for the date
      const existingPrice = await GoldPrice.findOne({
        where: {
          date: formattedDate,
          is_deleted: false
        },
        transaction: t
      });

      // If exists, mark it as deleted and handle associated transactions
      if (existingPrice) {
        // First update the gold price
        await existingPrice.update({ is_deleted: true }, { transaction: t });
        
        // Then soft delete all bonus transactions associated with this price
        // This will be handled separately to ensure user points are adjusted properly
      }

      // Create new price entry
      const newPrice = await GoldPrice.create({
        date: formattedDate,
        pricePerGram
      }, { transaction: t });

      return { newPrice, existingPriceId: existingPrice?.id };
    });

    // Process bonus transactions outside the transaction to avoid deadlocks
    if (result.existingPriceId) {
      await softDeleteBonusTransactions(result.existingPriceId);
    }

    // Emit event for price analysis
    goldPriceEmitter.emit("goldPriceSet", result.newPrice);

    res.status(200).json({
      message: "Gold price set successfully!",
      goldPrice: result.newPrice,
      transactionsUpdated: result.existingPriceId ? true : false
    });
  } catch (error: any) {
    console.error("Gold Price Set Error:", {
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

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ 
        error: "Duplicate Entry",
        details: "A gold price for this date already exists"
      });
    }

    res.status(500).json({ error: "Failed to set gold price" });
  }
};

// Get gold price history with pagination
export const getGoldPrices = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
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
    
    const result = await getPaginatedGoldPrices(page, limit);
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error("Gold Price Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ 
      success: false,
      error: "Failed to fetch gold prices" 
    });
  }
};

export const getGoldPriceGraph = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30; // Default to 30 days if not specified

    // Validate days parameter
    if (isNaN(days) || days <= 0 || days > 365) {
      return res.status(400).json({
        error: "Invalid days parameter",
        details: "Days must be a number between 1 and 365"
      });
    }

    const graphData = await getLastNDaysGoldPrices(days);    
    // Add summary statistics
    const summary = {
      totalDays: graphData.data.length,
      currentPrice: graphData.data[graphData.data.length - 1]?.pricePerGram || 0,
      yesterdaysPrice: graphData.data[graphData.data.length - 2]?.pricePerGram || 0,
      lowestPrice: Math.min(...graphData.data.map(d => d.pricePerGram)),
      highestPrice: Math.max(...graphData.data.map(d => d.pricePerGram)),
      overallChange: graphData.data.length > 1 
        ? graphData.data[graphData.data.length - 1].pricePerGram - graphData.data[0].pricePerGram 
        : 0,
      overallChangePercentage: graphData.data.length > 1
        ? ((graphData.data[graphData.data.length - 1].pricePerGram - graphData.data[0].pricePerGram) / graphData.data[0].pricePerGram) * 100
        : 0
    };

    res.status(200).json({
      message: "Gold price graph data retrieved successfully",
      data: graphData,
      summary
    });
  } catch (error: any) {
    console.error("Gold Price Graph Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to retrieve gold price graph data" });
  }
};

// Get today's latest gold price
export const getCurrentGoldPrice = async (_req: Request, res: Response) => {
  try {
    const currentPrice = await GoldPrice.findOne({
      where: { is_deleted: false },
      order: [["date", "DESC"]],
      attributes: ['id', 'date', 'pricePerGram', 'createdAt']
    });

    if (!currentPrice) {
      return res.status(404).json({
        error: "Not Found",
        details: "No active gold price found"
      });
    }

    res.status(200).json({
      message: "Current gold price fetched successfully",
      data: {
        id: currentPrice.id,
        date: currentPrice.date,
        pricePerGram: currentPrice.pricePerGram
      }
    });
  } catch (error: any) {
    console.error("Current Gold Price Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch current gold price" });
  }
};
