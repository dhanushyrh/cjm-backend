import { Op, literal } from "sequelize";
import User from "../models/User";
import Scheme from "../models/Scheme";
import UserScheme from "../models/UserScheme";
import Transaction from "../models/Transaction";
import GoldPrice from "../models/GoldPrice";
import RedemptionRequest from "../models/RedemptionRequest";
import sequelize from "../config/database";

// Interface for scheme distribution items
interface SchemeDistributionItem {
  id: string;
  name: string;
  count: number;
}

export interface DashboardStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
  };
  goldPrice: {
    currentPrice: number;
    lastUpdated: string | null;
    priceHistory: Array<{
      date: string;
      price: number;
    }>;
  };
  schemeStats: {
    totalSchemes: number;
    activeSchemes: number;
    schemeDistribution: Array<{
      name: string;
      count: number;
    }>;
  };
  userSchemeStats: {
    totalUserSchemes: number;
    activeUserSchemes: number;
    completedUserSchemes: number;
    withdrawnUserSchemes: number;
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
  redemptionStats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalPointsRedeemed: number;
  };
  nearingMaturitySchemes: Array<{
    id: string;
    name: string;
    userName: string;
    daysLeft: number;
    endDate: string;
    status: string;
    goldGrams: string;
    duration: number;
    startDate: string;
    availablePoints: number;
  }>;
  recentTransactions: Array<{
    id: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
    scheme: {
      id: string;
      name: string;
    };
    transactionType: string;
    amount: string;
    goldGrams: string;
  }>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log("Starting dashboard stats generation");

    // Get user statistics
    console.log("Fetching user statistics");
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: {
        is_active: true
      }
    });
    console.log(`User stats: total=${totalUsers}, active=${activeUsers}`);

    // Get scheme statistics
    console.log("Fetching scheme statistics");
    const totalSchemes = await Scheme.count();
    const activeSchemes = await Scheme.count();
    console.log(`Scheme stats: total=${totalSchemes}, active=${activeSchemes}`);

    // Get scheme distribution
    let schemeDistribution: SchemeDistributionItem[] = [];
    try {
      const rawSchemes = await Scheme.findAll({
        attributes: [
          'id',
          'name',
          [literal('(SELECT COUNT(*) FROM "UserSchemes" WHERE "UserSchemes"."schemeId" = "Scheme"."id" AND "UserSchemes"."status" = \'ACTIVE\')'), 'count']
        ],
        raw: true
      });
      
      schemeDistribution = rawSchemes.map((scheme: any) => ({
        id: scheme.id,
        name: scheme.name,
        count: Number(scheme.count || 0)
      }));
    } catch (error) {
      console.error("Error fetching scheme distribution:", error);
      const rawSchemes = await Scheme.findAll({
        attributes: ['id', 'name'],
        raw: true
      });

      // For each scheme, manually count user schemes
      for (const rawScheme of rawSchemes) {
        const count = await UserScheme.count({
          where: {
            schemeId: rawScheme.id,
            status: 'ACTIVE'
          }
        });
        schemeDistribution.push({
          id: rawScheme.id,
          name: rawScheme.name,
          count
        });
      }
    }

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

    // Get transaction statistics
    const transactions = await Transaction.findAll({
      where: {
        is_deleted: false // Only include non-deleted transactions
      }
    });
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
      const amount = Number(transaction.amount) || 0;
      const goldGrams = Number(transaction.goldGrams) || 0;
      
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

    // Get current gold price and price history
    console.log("Fetching gold price data");
    let latestGoldPrice = null;
    try {
      latestGoldPrice = await GoldPrice.findOne({
        where: {
          is_deleted: false
        },
        order: [['date', 'DESC']]
      });
      console.log("Latest gold price:", latestGoldPrice ? {
        id: latestGoldPrice.id,
        price: latestGoldPrice.pricePerGram,
        date: latestGoldPrice.date
      } : "No gold price data found");
    } catch (error) {
      console.error("Error fetching latest gold price:", error);
    }
    
    // Get gold price history for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let goldPriceHistory: GoldPrice[] = [];
    try {
      goldPriceHistory = await GoldPrice.findAll({
        where: {
          is_deleted: false,
          date: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        order: [['date', 'ASC']]
      });
      console.log(`Found ${goldPriceHistory.length} gold price history records`);
    } catch (error) {
      console.error("Error fetching gold price history:", error);
    }

    // Get redemption statistics
    const totalRequests = await RedemptionRequest.count({
      where: {
        is_deleted: false
      }
    });
    const pendingRequests = await RedemptionRequest.count({
      where: {
        status: "PENDING",
        is_deleted: false
      }
    });
    const approvedRequests = await RedemptionRequest.count({
      where: {
        status: "APPROVED",
        is_deleted: false
      }
    });
    const rejectedRequests = await RedemptionRequest.count({
      where: {
        status: "REJECTED",
        is_deleted: false
      }
    });

    // Calculate total points redeemed from approved requests
    const approvedRedemptions = await RedemptionRequest.findAll({
      where: {
        status: "APPROVED",
        is_deleted: false
      }
    });
    const totalPointsRedeemed = approvedRedemptions.reduce(
      (sum, request) => sum + Number(request.points || 0), 
      0
    );

    // Get schemes nearing maturity (due in the next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    let nearingMaturitySchemes: UserScheme[] = [];
    try {
      nearingMaturitySchemes = await UserScheme.findAll({
        where: {
          status: "ACTIVE",
          endDate: {
            [Op.between]: [today, thirtyDaysFromNow]
          }
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Scheme,
            as: 'scheme',
            attributes: ['id', 'name', 'goldGrams', 'duration']
          }
        ],
        order: [['endDate', 'ASC']],
        limit: 10
      });
    } catch (error) {
      console.error("Error fetching nearing maturity schemes:", error);
      nearingMaturitySchemes = [];
    }

    // Format nearing maturity schemes
    const formattedNearingMaturitySchemes = nearingMaturitySchemes.map(userScheme => {
      try {
        const endDate = new Date(userScheme.endDate);
        const startDate = new Date(userScheme.startDate);
        const today = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: userScheme.id,
          name: userScheme.scheme?.name || '',
          userName: userScheme.user?.name || '',
          daysLeft,
          endDate: endDate instanceof Date ? endDate.toISOString().split('T')[0] : String(endDate),
          status: userScheme.status,
          goldGrams: userScheme.scheme?.goldGrams?.toString() || '0',
          duration: userScheme.scheme?.duration || 0,
          startDate: startDate instanceof Date ? startDate.toISOString().split('T')[0] : String(startDate),
          availablePoints: userScheme.availablePoints
        };
      } catch (error) {
        console.error("Error formatting maturity scheme:", error);
        return {
          id: userScheme.id || '',
          name: '',
          userName: '',
          daysLeft: 0,
          endDate: '',
          status: '',
          goldGrams: '0',
          duration: 0,
          startDate: '',
          availablePoints: 0
        };
      }
    });

    // Get recent transactions (last 10)
    let recentTransactions: Transaction[] = [];
    try {
      recentTransactions = await Transaction.findAll({
        where: {
          is_deleted: false
        },
        include: [
          {
            model: UserScheme,
            as: 'userScheme',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name']
              },
              {
                model: Scheme,
                as: 'scheme',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      recentTransactions = [];
    }

    // Format recent transactions
    const formattedRecentTransactions = recentTransactions.map(transaction => {
      try {
        return {
          id: transaction.id,
          createdAt: transaction.createdAt instanceof Date ? 
            transaction.createdAt.toISOString().split('T')[0] : 
            String(transaction.createdAt),
          user: {
            id: transaction.userScheme?.user?.id || '',
            name: transaction.userScheme?.user?.name || ''
          },
          scheme: {
            id: transaction.userScheme?.scheme?.id || '',
            name: transaction.userScheme?.scheme?.name || ''
          },
          transactionType: transaction.transactionType,
          amount: transaction.amount.toString(),
          goldGrams: transaction.goldGrams.toString()
        };
      } catch (error) {
        console.error("Error formatting transaction:", error);
        return {
          id: transaction.id || '',
          createdAt: '',
          user: { id: '', name: '' },
          scheme: { id: '', name: '' },
          transactionType: '',
          amount: '0',
          goldGrams: '0'
        };
      }
    });

    console.log("Dashboard stats generated successfully");
    
    return {
      userStats: {
        totalUsers,
        activeUsers
      },
      goldPrice: {
        currentPrice: latestGoldPrice ? Number(latestGoldPrice.pricePerGram) : 0,
        lastUpdated: latestGoldPrice ? 
          (latestGoldPrice.date instanceof Date ? 
            latestGoldPrice.date.toISOString().split('T')[0] : 
            String(latestGoldPrice.date)) : null,
        priceHistory: goldPriceHistory.map(price => ({
          date: price.date instanceof Date ? 
            price.date.toISOString().split('T')[0] : 
            String(price.date),
          price: Number(price.pricePerGram)
        }))
      },
      schemeStats: {
        totalSchemes,
        activeSchemes,
        schemeDistribution: schemeDistribution.map(item => ({
          name: item.name,
          count: item.count
        }))
      },
      userSchemeStats: {
        totalUserSchemes,
        activeUserSchemes,
        completedUserSchemes,
        withdrawnUserSchemes
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
      redemptionStats: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalPointsRedeemed
      },
      nearingMaturitySchemes: formattedNearingMaturitySchemes,
      recentTransactions: formattedRecentTransactions
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    
    // Return empty data structure to avoid breaking UI
    return {
      userStats: {
        totalUsers: 0,
        activeUsers: 0
      },
      goldPrice: {
        currentPrice: 0,
        lastUpdated: null,
        priceHistory: []
      },
      schemeStats: {
        totalSchemes: 0,
        activeSchemes: 0,
        schemeDistribution: []
      },
      userSchemeStats: {
        totalUserSchemes: 0,
        activeUserSchemes: 0,
        completedUserSchemes: 0,
        withdrawnUserSchemes: 0
      },
      transactionStats: {
        totalTransactions: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalAmount: 0,
        totalGoldGrams: 0,
        totalPoints: 0,
        transactionsByType: {
          deposit: 0,
          withdrawal: 0,
          points: 0,
          bonus_withdrawal: 0
        }
      },
      redemptionStats: {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalPointsRedeemed: 0
      },
      nearingMaturitySchemes: [],
      recentTransactions: []
    };
  }
}; 