import { Op } from "sequelize";
import User from "../models/User";
import Scheme from "../models/Scheme";
import UserScheme from "../models/UserScheme";
import Transaction from "../models/Transaction";
import GoldPrice from "../models/GoldPrice";
import RedemptionRequest from "../models/RedemptionRequest";

export interface DashboardStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    usersByStatus: {
      active: number;
      inactive: number;
    };
  };
  schemeStats: {
    totalSchemes: number;
    activeSchemes: number;
  };
  userSchemeStats: {
    totalUserSchemes: number;
    activeUserSchemes: number;
    completedUserSchemes: number;
    withdrawnUserSchemes: number;
    userSchemesByStatus: {
      [key: string]: number;
    };
  };
  transactionStats: {
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalAmount: number;
    totalGoldGrams: number;
    totalPoints: number;
    transactionsByType: {
      [key: string]: number;
    };
  };
  goldStats: {
    currentGoldPrice: number;
    lastUpdated: Date | null;
  };
  redemptionStats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalPointsRedeemed: number;
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get user statistics
  const totalUsers = await User.count();
  const activeUsers = await User.count({
    where: {
      agreeTerms: true
    }
  });

  // Get scheme statistics
  const totalSchemes = await Scheme.count();
  const activeSchemes = totalSchemes;

  // Get user scheme statistics
  const totalUserSchemes = await UserScheme.count();
  const activeUserSchemes = await UserScheme.count({
    where: {
      status: "ACTIVE"
    }
  });
  const completedUserSchemes = await UserScheme.count({
    where: {
      status: "COMPLETED"
    }
  });
  const withdrawnUserSchemes = await UserScheme.count({
    where: {
      status: "WITHDRAWN"
    }
  });

  // Get user schemes by status
  const userSchemesByStatus = {
    ACTIVE: activeUserSchemes,
    COMPLETED: completedUserSchemes,
    WITHDRAWN: withdrawnUserSchemes
  };

  // Get transaction statistics
  const transactions = await Transaction.findAll();
  const totalTransactions = transactions.length;
  
  // Initialize values
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let totalAmount = 0;
  let totalGoldGrams = 0;
  let totalPoints = 0;
  
  // Initialize transaction count by type
  const transactionsByType: { [key: string]: number } = {
    deposit: 0,
    withdrawal: 0,
    points: 0,
    bonus_withdrawal: 0
  };

  // Calculate totals
  transactions.forEach(transaction => {
    const amount = Number(transaction.amount);
    const goldGrams = Number(transaction.goldGrams);
    
    // Increment type count
    if (transaction.transactionType in transactionsByType) {
      transactionsByType[transaction.transactionType]++;
    } else {
      transactionsByType[transaction.transactionType] = 1;
    }
    
    // Calculate totals based on transaction type
    if (transaction.transactionType === "deposit") {
      totalDeposits += amount;
      totalAmount += amount;
      totalGoldGrams += goldGrams;
    } else if (transaction.transactionType === "withdrawal") {
      totalWithdrawals += amount;
      totalAmount -= amount;
      totalGoldGrams -= goldGrams;
    }
    
    // Add points for all transaction types
    totalPoints += transaction.points || 0;
  });

  // Get current gold price
  const latestGoldPrice = await GoldPrice.findOne({
    order: [['date', 'DESC']]
  });

  // Get redemption statistics
  const totalRequests = await RedemptionRequest.count();
  const pendingRequests = await RedemptionRequest.count({
    where: {
      status: "PENDING"
    }
  });
  const approvedRequests = await RedemptionRequest.count({
    where: {
      status: "APPROVED"
    }
  });
  const rejectedRequests = await RedemptionRequest.count({
    where: {
      status: "REJECTED"
    }
  });

  // Calculate total points redeemed from approved requests
  const approvedRedemptions = await RedemptionRequest.findAll({
    where: {
      status: "APPROVED"
    }
  });
  const totalPointsRedeemed = approvedRedemptions.reduce(
    (sum, request) => sum + Number(request.points), 
    0
  );

  return {
    userStats: {
      totalUsers,
      activeUsers,
      usersByStatus: {
        active: activeUsers,
        inactive: totalUsers - activeUsers
      }
    },
    schemeStats: {
      totalSchemes,
      activeSchemes
    },
    userSchemeStats: {
      totalUserSchemes,
      activeUserSchemes,
      completedUserSchemes,
      withdrawnUserSchemes,
      userSchemesByStatus
    },
    transactionStats: {
      totalTransactions,
      totalDeposits,
      totalWithdrawals,
      totalAmount,
      totalGoldGrams,
      totalPoints,
      transactionsByType
    },
    goldStats: {
      currentGoldPrice: latestGoldPrice ? Number(latestGoldPrice.pricePerGram) : 0,
      lastUpdated: latestGoldPrice ? latestGoldPrice.date : null
    },
    redemptionStats: {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalPointsRedeemed
    }
  };
}; 