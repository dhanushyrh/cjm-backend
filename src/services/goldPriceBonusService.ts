import { Transaction as SequelizeTransaction } from "sequelize";
import UserScheme, { UserSchemeStatus } from "../models/UserScheme";
import GoldPrice from "../models/GoldPrice";
import Settings from "../models/Settings";
import { createTransaction } from "./transactionService";
import Transaction from "../models/Transaction";
import Scheme from "../models/Scheme";

interface BonusConfig {
  defaultBonus: number;
  modValue: number;
}

export const softDeleteBonusTransactions = async (goldPriceId: string) => {
  try {
    await Transaction.update(
      { is_deleted: true },
      {
        where: {
          priceRefId: goldPriceId,
          transactionType: "points",
          is_deleted: false
        }
      }
    );
  } catch (error) {
    console.error("Error soft deleting bonus transactions:", error);
    throw error;
  }
};

export const calculateAndAddBonusPoints = async (newPrice: GoldPrice, previousPrice: GoldPrice) => {
  try {
    // Get bonus configuration from settings
    const [defaultBonusPoints, bonusModValue] = await Promise.all([
      Settings.findOne({
        where: { 
          key: "defaultBonusPoints",
          is_deleted: false 
        }
      }),
      Settings.findOne({
        where: { 
          key: "bonusModValue",
          is_deleted: false 
        }
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
    const priceDifference = Number(newPrice.pricePerGram) - Number(previousPrice.pricePerGram);
    
    // Get all active user schemes
    const activeUserSchemes = await UserScheme.findAll({
      where: { status: "ACTIVE" },
      include: [
        {
          model: Scheme,
          as: "scheme",
          required: true
        }
      ]
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
            amount: amount,
            goldGrams: 0, // No gold grams for bonus points
            points: schemePoints,
            priceRefId: newPrice.id, // Add reference to the gold price
            description: `Bonus points awarded for gold price ${priceDifference > 0 ? 'increase' : 'maintenance'}`
          });

          // Update available points in UserScheme
          await userScheme.update({
            availablePoints: userScheme.availablePoints + schemePoints
          });

          return bonusTransaction;
        } catch (error) {
          console.error(`Failed to create bonus transaction for userScheme ${userScheme.id}:`, error);
          return null;
        }
      })
    );

    // Calculate total bonus points for summary
    const totalBonusPoints = bonusTransactions.reduce((sum, t) => {
      if (t) {
        return sum + t.points;
      }
      return sum;
    }, 0);

    // Filter out failed transactions
    const successfulTransactions = bonusTransactions.filter(t => t !== null);

    return {
      bonusPoints: totalBonusPoints,
      priceDifference,
      transactionsCreated: successfulTransactions.length,
      totalUserSchemes: activeUserSchemes.length,
      priceRefId: newPrice.id
    };
  } catch (error) {
    console.error("Bonus Points Calculation Error:", error);
    throw error;
  }
}; 