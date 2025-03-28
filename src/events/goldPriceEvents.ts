import { EventEmitter } from "events";
import { Op } from "sequelize";
import GoldPrice from "../models/GoldPrice";
import { format, subDays } from "date-fns";
import { calculateAndAddBonusPoints, softDeleteBonusTransactions } from "../services/goldPriceBonusService";

export const goldPriceEmitter = new EventEmitter();

// Event handler for gold price soft delete
goldPriceEmitter.on("goldPriceDeleted", async (goldPriceId: string) => {
  try {
    // Soft delete related bonus transactions
    await softDeleteBonusTransactions(goldPriceId);

    // Get the deleted price
    const deletedPrice = await GoldPrice.findByPk(goldPriceId);
    if (!deletedPrice) {
      throw new Error("Deleted gold price not found");
    }

    // Find the previous valid price for this date
    const previousPrice = await GoldPrice.findOne({
      where: {
        date: deletedPrice.date,
        is_deleted: false,
        id: { [Op.ne]: goldPriceId }
      },
      order: [["createdAt", "DESC"]]
    });

    if (previousPrice) {
      // Get yesterday's price for bonus calculation
      const yesterday = format(subDays(new Date(previousPrice.date), 1), "yyyy-MM-dd");
      const yesterdayPrice = await GoldPrice.findOne({
        where: {
          date: yesterday,
          is_deleted: false
        }
      });

      if (yesterdayPrice) {
        // Calculate and add new bonus points
        const bonusResult = await calculateAndAddBonusPoints(previousPrice, yesterdayPrice);
        console.log("New Bonus Points Distribution after price update:", bonusResult);
      }
    }
  } catch (error) {
    console.error("Error handling gold price deletion:", error);
  }
});

// Event handler for new gold price
goldPriceEmitter.on("goldPriceSet", async (newPrice: GoldPrice) => {
  try {
    // Get yesterday's date
    const yesterday = format(subDays(new Date(newPrice.date), 1), "yyyy-MM-dd");

    // Find yesterday's price
    const yesterdayPrice = await GoldPrice.findOne({
      where: {
        date: yesterday,
        is_deleted: false
      }
    });

    if (yesterdayPrice) {
      const priceDifference = Number(newPrice.pricePerGram) - Number(yesterdayPrice.pricePerGram);
      const percentageChange = (priceDifference / Number(yesterdayPrice.pricePerGram)) * 100;

      console.log("Gold Price Change Analysis:", {
        date: newPrice.date,
        currentPrice: newPrice.pricePerGram,
        previousPrice: yesterdayPrice.pricePerGram,
        difference: priceDifference.toFixed(2),
        percentageChange: percentageChange.toFixed(2) + "%",
        trend: priceDifference > 0 ? "INCREASE" : priceDifference < 0 ? "DECREASE" : "NO_CHANGE"
      });

      // Calculate and add bonus points
      const bonusResult = await calculateAndAddBonusPoints(newPrice, yesterdayPrice);
      console.log("Bonus Points Distribution:", bonusResult);
    } else {
      console.log("Gold Price Analysis: No previous day price available for comparison");
    }
  } catch (error) {
    console.error("Error in gold price analysis:", error);
  }
}); 