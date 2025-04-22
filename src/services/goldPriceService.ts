import { Op } from "sequelize";
import { subDays, format, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import sequelize from "../config/database";
import GoldPrice from "../models/GoldPrice";
import Transaction from "../models/Transaction";
import UserScheme from "../models/UserScheme";
import Scheme from "../models/Scheme";
import { calculatePoints } from "../utils/pointCalculator";


export interface GoldPriceGraphData {
  date: string;
  pricePerGram: number;
  trend: "INCREASE" | "DECREASE" | "NO_CHANGE";
  change: number;
  changePercentage: number;
  isInterpolated: boolean;
}

export interface GoldPriceStatistics {
  totalDays: number;
  currentPrice: number;
  lowestPrice: {
    price: number;
    date: string;
  };
  highestPrice: {
    price: number;
    date: string;
  };
  averagePrice: number;
  medianPrice: number;
  standardDeviation: number;
  volatility: number; // Standard deviation of daily returns
  overallChange: number;
  overallChangePercentage: number;
  trendAnalysis: {
    increaseDays: number;
    decreaseDays: number;
    noChangeDays: number;
    dominantTrend: "INCREASE" | "DECREASE" | "NO_CHANGE";
  };
  movingAverages: {
    sevenDay: number;
    thirtyDay: number;
  };
  interpolatedDaysCount: number;
}

const calculateStatistics = (data: GoldPriceGraphData[]): GoldPriceStatistics => {
  if (data.length === 0) {
    return {
      totalDays: 0,
      currentPrice: 0,
      lowestPrice: { price: 0, date: "" },
      highestPrice: { price: 0, date: "" },
      averagePrice: 0,
      medianPrice: 0,
      standardDeviation: 0,
      volatility: 0,
      overallChange: 0,
      overallChangePercentage: 0,
      trendAnalysis: {
        increaseDays: 0,
        decreaseDays: 0,
        noChangeDays: 0,
        dominantTrend: "NO_CHANGE"
      },
      movingAverages: {
        sevenDay: 0,
        thirtyDay: 0
      },
      interpolatedDaysCount: 0
    };
  }

  const prices = data.map(d => d.pricePerGram);
  const sortedPrices = [...prices].sort((a, b) => a - b);
  
  // Basic statistics
  const totalDays = data.length;
  const currentPrice = data[data.length - 1].pricePerGram;
  const lowestPrice = {
    price: Math.min(...prices),
    date: data.find(d => d.pricePerGram === Math.min(...prices))!.date
  };
  const highestPrice = {
    price: Math.max(...prices),
    date: data.find(d => d.pricePerGram === Math.max(...prices))!.date
  };
  const averagePrice = Number((prices.reduce((a, b) => a + b, 0) / totalDays).toFixed(2));
  const medianPrice = totalDays % 2 === 0
    ? (sortedPrices[totalDays / 2 - 1] + sortedPrices[totalDays / 2]) / 2
    : sortedPrices[Math.floor(totalDays / 2)];

  // Standard deviation
  const variance = prices.reduce((acc, price) => acc + Math.pow(price - averagePrice, 2), 0) / totalDays;
  const standardDeviation = Number(Math.sqrt(variance).toFixed(2));

  // Daily returns for volatility
  const dailyReturns = data.slice(1).map((d, i) => (d.pricePerGram - data[i].pricePerGram) / data[i].pricePerGram);
  const volatility = Number((Math.sqrt(dailyReturns.reduce((acc, ret) => acc + Math.pow(ret, 2), 0) / (dailyReturns.length - 1)) * Math.sqrt(252)).toFixed(4));

  // Trend analysis
  const trendCounts = data.reduce((acc, d) => {
    acc[d.trend]++;
    return acc;
  }, { INCREASE: 0, DECREASE: 0, NO_CHANGE: 0 });

  const dominantTrend = Object.entries(trendCounts)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0] as "INCREASE" | "DECREASE" | "NO_CHANGE";

  // Moving averages
  const sevenDay = data.slice(-7).reduce((acc, d) => acc + d.pricePerGram, 0) / Math.min(7, data.length);
  const thirtyDay = data.slice(-30).reduce((acc, d) => acc + d.pricePerGram, 0) / Math.min(30, data.length);

  return {
    totalDays,
    currentPrice,
    lowestPrice,
    highestPrice,
    averagePrice,
    medianPrice,
    standardDeviation,
    volatility,
    overallChange: Number((data[data.length - 1].pricePerGram - data[0].pricePerGram).toFixed(2)),
    overallChangePercentage: Number((((data[data.length - 1].pricePerGram - data[0].pricePerGram) / data[0].pricePerGram) * 100).toFixed(2)),
    trendAnalysis: {
      increaseDays: trendCounts.INCREASE,
      decreaseDays: trendCounts.DECREASE,
      noChangeDays: trendCounts.NO_CHANGE,
      dominantTrend
    },
    movingAverages: {
      sevenDay: Number(sevenDay.toFixed(2)),
      thirtyDay: Number(thirtyDay.toFixed(2))
    },
    interpolatedDaysCount: data.filter(d => d.isInterpolated).length
  };
};

const interpolatePrice = (date: Date, prevPrice: GoldPriceGraphData, nextPrice: GoldPriceGraphData): number => {
  const prevDate = parseISO(prevPrice.date);
  const nextDate = parseISO(nextPrice.date);
  const totalDays = (nextDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysFromPrev = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
  const ratio = daysFromPrev / totalDays;
  
  return Number((prevPrice.pricePerGram + (nextPrice.pricePerGram - prevPrice.pricePerGram) * ratio).toFixed(2));
};

export const getLastNDaysGoldPrices = async (days: number): Promise<{ data: GoldPriceGraphData[], statistics: GoldPriceStatistics }> => {

  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  // Get gold prices for the date range
  const prices = await GoldPrice.findAll({
    where: {
      date: {
        [Op.between]: [
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd")
        ]
      },
      is_deleted: false
    },
    order: [["date", "ASC"]]
  });

  // Get all dates in the range
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Transform data and calculate trends with interpolation
  const graphData: GoldPriceGraphData[] = [];
  let previousPrice: GoldPriceGraphData | null = null;

  for (const date of allDates) {
    const formattedDate = format(date, "yyyy-MM-dd");
    const existingPrice = prices.find(p => isSameDay(new Date(p.date), date));

    let priceData: GoldPriceGraphData;

    if (existingPrice) {
      const currentPrice = Number(existingPrice.pricePerGram);
      priceData = {
        date: formattedDate,
        pricePerGram: currentPrice,
        trend: "NO_CHANGE",
        change: 0,
        changePercentage: 0,
        isInterpolated: false
      };
    } else {
      // Find next available price for interpolation
      const nextPrice = prices.find(p => new Date(p.date) > date);
      let interpolatedPrice: number;

      if (previousPrice && nextPrice) {
        // Interpolate between previous and next price
        interpolatedPrice = interpolatePrice(date, previousPrice, {
          date: format(new Date(nextPrice.date), "yyyy-MM-dd"),
          pricePerGram: Number(nextPrice.pricePerGram),
          trend: "NO_CHANGE",
          change: 0,
          changePercentage: 0,
          isInterpolated: false
        });
      } else if (previousPrice) {
        // Use previous price if no next price available
        interpolatedPrice = previousPrice.pricePerGram;
      } else if (nextPrice) {
        // Use next price if no previous price available
        interpolatedPrice = Number(nextPrice.pricePerGram);
      } else {
        continue; // Skip if no reference prices available
      }

      priceData = {
        date: formattedDate,
        pricePerGram: interpolatedPrice,
        trend: "NO_CHANGE",
        change: 0,
        changePercentage: 0,
        isInterpolated: true
      };
    }

    // Calculate trends
    if (previousPrice) {
      const change = Number((priceData.pricePerGram - previousPrice.pricePerGram).toFixed(2));
      const changePercentage = Number(((change / previousPrice.pricePerGram) * 100).toFixed(2));
      priceData.trend = change > 0 ? "INCREASE" : change < 0 ? "DECREASE" : "NO_CHANGE";
      priceData.change = change;
      priceData.changePercentage = changePercentage;
    }

    graphData.push(priceData);
    previousPrice = priceData;
  }

  const statistics = calculateStatistics(graphData);
  const result = { data: graphData, statistics };

  return result;
};

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const getPaginatedGoldPrices = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<GoldPrice>> => {
  const offset = (page - 1) * limit;
  
  const { count, rows } = await GoldPrice.findAndCountAll({ 
    where: { is_deleted: false },
    limit,
    offset,
    order: [["date", "DESC"]],
    attributes: ['id', 'date', 'pricePerGram', 'createdAt', 'updatedAt']
  });
  
  const pages = Math.ceil(count / limit);
  
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages
    }
  };
};

// export const updateGoldPrice = async (id: number, price: number): Promise<GoldPrice> => {
//   const transaction = await sequelize.transaction();

//   try {
//     // Find the existing price
//     const existingPrice = await GoldPrice.findByPk(id);
//     if (!existingPrice) {
//       throw new Error("Gold price not found");
//     }

//     // Check if there's another price for the same date
//     const sameDatePrice = await GoldPrice.findOne({
//       where: {
//         date: existingPrice.date,
//         id: { [Op.ne]: id }
//       }
//     });

//     if (sameDatePrice) {
//       // Mark the old price as deleted
//       await sameDatePrice.update({ is_deleted: true }, { transaction });
      
//       // Mark all transactions associated with the old price as deleted
//       await Transaction.update(
//         { is_deleted: true },
//         {
//           where: {
//             priceRefId: sameDatePrice.id,
//             is_deleted: false
//           },
//           transaction
//         }
//       );
//     }

//     // Update the current price
//     const updatedPrice = await existingPrice.update(
//       { pricePerGram: price, is_deleted: false },
//       { transaction }
//     );

//     // Find all transactions using this price
//     const affectedTransactions = await Transaction.findAll({
//       where: {
//         priceRefId: id,
//         is_deleted: false
//       },
//       include: [{
//         model: UserScheme,
//         as: 'userScheme',
//         required: true,
//         include: [{
//           model: Scheme,
//           as: 'scheme',
//           required: true
//         }]
//       }]
//     });

//     // Mark old transactions as deleted
//     await Transaction.update(
//       { is_deleted: true },
//       {
//         where: {
//           priceRefId: id,
//           is_deleted: false
//         },
//         transaction
//       }
//     );
    
//     // Track point adjustments for each user scheme
//     const pointAdjustments = new Map<string, number>();

//     // Create new transactions with updated points
//     for (const oldTransaction of affectedTransactions) {
//       const userScheme = oldTransaction.userScheme!;
//       const newPoints = calculatePoints(oldTransaction.amount, price, userScheme.scheme!.goldGrams);
//       const pointDifference = newPoints - oldTransaction.points;
      
//       // Track point adjustments
//       const currentAdjustment = pointAdjustments.get(userScheme.id) || 0;
//       pointAdjustments.set(userScheme.id, currentAdjustment + pointDifference);
      
//       await Transaction.create({
//         userSchemeId: oldTransaction.userSchemeId,
//         transactionType: oldTransaction.transactionType,
//         amount: oldTransaction.amount,
//         goldGrams: oldTransaction.goldGrams,
//         points: newPoints,
//         priceRefId: id,
//         redeemReqId: oldTransaction.redeemReqId,
//         description: oldTransaction.description,
//         is_deleted: false
//       }, { transaction });
//     }
    
//     // Update UserScheme point balances
//     for (const [userSchemeId, pointDifference] of pointAdjustments.entries()) {
//       const userScheme = await UserScheme.findByPk(userSchemeId, { transaction });
//       if (userScheme) {
//         await userScheme.update({
//           totalPoints: userScheme.totalPoints + pointDifference,
//           availablePoints: userScheme.availablePoints + pointDifference
//         }, { transaction });
//       }
//     }

//     await transaction.commit();
//     return updatedPrice;
//   } catch (error) {
//     await transaction.rollback();
//     throw error;
//   }
// }; 