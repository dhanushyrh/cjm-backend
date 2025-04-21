import { Transaction as SequelizeTransaction } from "sequelize";
import UserScheme, { UserSchemeStatus } from "../models/UserScheme";
import GoldPrice from "../models/GoldPrice";
import Settings from "../models/Settings";
import { createTransaction } from "./transactionService";
import Transaction from "../models/Transaction";
import Scheme from "../models/Scheme";
import sequelize from "../config/database";

interface BonusConfig {
  defaultBonus: number;
  modValue: number;
}

// Function to adjust user scheme points when transactions are deleted
export const adjustUserSchemePointsForDeletedTransactions = async (
  priceRefId: string,
  transaction?: SequelizeTransaction
) => {
  try {
    // Get all deleted transactions with the given price reference
    const deletedTransactions = await Transaction.findAll({
      where: {
        priceRefId,
        is_deleted: true,
        transactionType: "points" // Only bonus point transactions
      },
      transaction
    });

    // Group transactions by userSchemeId to calculate net point adjustments
    const pointAdjustments = new Map<string, number>();
    
    for (const tx of deletedTransactions) {
      const currentPoints = pointAdjustments.get(tx.userSchemeId) || 0;
      pointAdjustments.set(tx.userSchemeId, currentPoints - tx.points);
    }

    // Update each user scheme's points
    for (const [userSchemeId, pointAdjustment] of pointAdjustments.entries()) {
      const userScheme = await UserScheme.findByPk(userSchemeId, { transaction });
      if (userScheme) {
        await userScheme.update({
          totalPoints: Math.max(0, userScheme.totalPoints + pointAdjustment), // Prevent negative total points
          availablePoints: Math.max(0, userScheme.availablePoints + pointAdjustment) // Prevent negative available points
        }, { transaction });
      }
    }

    return {
      transactionsProcessed: deletedTransactions.length,
      userSchemesAdjusted: pointAdjustments.size
    };
  } catch (error) {
    console.error("Error adjusting points for deleted transactions:", error);
    throw error;
  }
};

export const softDeleteBonusTransactions = async (goldPriceId: string) => {
  const t = await sequelize.transaction();
  
  try {
    // Mark transactions as deleted
    await Transaction.update(
      { is_deleted: true },
      {
        where: {
          priceRefId: goldPriceId,
          transactionType: "points",
          is_deleted: false
        },
        transaction: t
      }
    );
    
    // Adjust user scheme points accordingly
    await adjustUserSchemePointsForDeletedTransactions(goldPriceId, t);
    
    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error("Error soft deleting bonus transactions:", error);
    throw error;
  }
};

export const calculateAndAddBonusPoints = async (newPrice: GoldPrice, previousPrice: GoldPrice) => {
  // Start a transaction to ensure data consistency
  const t = await sequelize.transaction();
  
  try {
    // First, mark any previous bonus transactions for this date as deleted
    // This handles the case when a gold price is updated for a specific date
    await Transaction.update(
      { is_deleted: true },
      {
        where: {
          priceRefId: previousPrice.id,
          transactionType: "points",
          is_deleted: false
        },
        transaction: t
      }
    );
    
    // Adjust user scheme points for the deleted transactions
    await adjustUserSchemePointsForDeletedTransactions(previousPrice.id, t);
    
    // Get bonus configuration from settings
    const [defaultBonusPoints, bonusModValue] = await Promise.all([
      Settings.findOne({
        where: { 
          key: "defaultBonusPoints",
          is_deleted: false 
        },
        transaction: t
      }),
      Settings.findOne({
        where: { 
          key: "bonusModValue",
          is_deleted: false 
        },
        transaction: t
      })
    ]);

    if (!defaultBonusPoints || !bonusModValue) {
      throw new Error("Required bonus settings not found");
    }

    const bonusConfig: BonusConfig = {
      defaultBonus: parseInt(defaultBonusPoints.value) || 5,
      modValue: parseInt(bonusModValue.value) || 10
    };

    // Calculate price difference
    const priceDifference = Math.trunc(Number(newPrice.pricePerGram)) - Math.trunc(Number(previousPrice.pricePerGram));
    
    // Get all active user schemes
    const activeUserSchemes = await UserScheme.findAll({
      where: { status: "ACTIVE" },
      include: [
        {
          model: Scheme,
          as: "scheme",
          required: true
        }
      ],
      transaction: t
    });

    // Create bonus transactions for each active user scheme
    const bonusTransactions = await Promise.all(
      activeUserSchemes.map(async (userScheme) => {
        try {
          if (!userScheme.scheme) {
            throw new Error(`Scheme not found for userScheme ${userScheme.id}`);
          }

          // Calculate bonus points based on price difference and scheme's gold grams
          let schemePoints: number;
          if (priceDifference > 0) {
            // If price increased, bonus = ceil(difference / modValue) * scheme's gold grams
            schemePoints = Math.ceil(priceDifference / bonusConfig.modValue) * Number(userScheme.scheme.goldGrams);
          } else {
            // If price decreased or stayed same, use default bonus * scheme's gold grams
            schemePoints = bonusConfig.defaultBonus * Number(userScheme.scheme.goldGrams);
          }

          // Calculate amount based on the new price
          const amount = Number(userScheme.scheme.goldGrams) * Number(newPrice.pricePerGram);
          
          // Create bonus transaction
          const bonusTransaction = await createTransaction({
            userSchemeId: userScheme.id,
            transactionType: "points",
            amount: 0,
            goldGrams: 0, // No gold grams for bonus points
            points: schemePoints,
            priceRefId: newPrice.id, // Add reference to the gold price
            description: `Bonus points awarded for gold price ${priceDifference > 0 ? 'increase' : 'maintenance'} of ₹${Math.abs(priceDifference).toFixed(2)} per gram`,
            transaction: t
          });

          // Update available points in UserScheme
          await userScheme.update({
            totalPoints: userScheme.totalPoints + schemePoints,
            availablePoints: userScheme.availablePoints + schemePoints
          }, { transaction: t });

          return {
            transaction: bonusTransaction,
            pointsAdded: schemePoints
          };
        } catch (error) {
          console.error(`Failed to create bonus transaction for userScheme ${userScheme.id}:`, error);
          return null;
        }
      })
    );

    // Calculate total bonus points for summary
    const totalBonusPoints = bonusTransactions.reduce((sum, t) => {
      if (t) {
        return sum + t.transaction.points;
      }
      return sum;
    }, 0);

    // Filter out failed transactions
    const successfulTransactions = bonusTransactions.filter(t => t !== null);
    
    // Commit the transaction
    await t.commit();

    return {
      bonusPoints: totalBonusPoints,
      priceDifference,
      transactionsCreated: successfulTransactions.length,
      totalUserSchemes: activeUserSchemes.length,
      priceRefId: newPrice.id,
      previousTransactionsDeleted: true
    };
  } catch (error) {
    // Rollback transaction in case of error
    await t.rollback();
    console.error("Bonus Points Calculation Error:", error);
    throw error;
  }
}; 