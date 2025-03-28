import { Request, Response } from "express";
import { Transaction } from "sequelize";
import sequelize from "../config/database";
import GoldPrice from "../models/GoldPrice";
import { goldPriceEmitter } from "../events/goldPriceEvents";

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

      // If exists, mark it as deleted
      if (existingPrice) {
        await existingPrice.update({ is_deleted: true }, { transaction: t });
      }

      // Create new price entry
      const newPrice = await GoldPrice.create({
        date: formattedDate,
        pricePerGram
      }, { transaction: t });

      return newPrice;
    });

    // Emit event for price analysis
    goldPriceEmitter.emit("goldPriceSet", result);

    res.status(200).json({
      message: "Gold price set successfully!",
      goldPrice: result
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

// Get gold price history
export const getGoldPrices = async (_req: Request, res: Response) => {
  try {
    const prices = await GoldPrice.findAll({ 
      order: [["date", "DESC"]],
      attributes: ['id', 'date', 'pricePerGram', 'createdAt', 'updatedAt']
    });
    
    res.status(200).json({
      message: "Gold prices fetched successfully",
      data: prices
    });
  } catch (error: any) {
    console.error("Gold Price Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch gold prices" });
  }
};
