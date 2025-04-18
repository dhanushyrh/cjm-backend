import { Sequelize, Op } from 'sequelize';
import User from '../models/User';
import Scheme from '../models/Scheme';
import UserScheme from '../models/UserScheme';
import Transaction from '../models/Transaction';
import GoldPrice from '../models/GoldPrice';
// Create a placeholder interface for PointRedemption until it's properly defined
interface PointRedemption {
  id: string;
  points: number;
  status: string;
}
// Mock the model methods needed in this file
const PointRedemption = {
  count: async (options?: any): Promise<number> => 0,
  sum: async (column: string, options?: any): Promise<number | null> => 0
};

import sequelize from '../config/database';

/**
 * Get comprehensive analytics data for the application
 */
export const getAnalytics = async () => {
  // User statistics
  const totalUsers = await User.count();
  const activeUsers = await User.count({ where: { is_active: true } });
  const inactiveUsers = totalUsers - activeUsers;

  // Scheme statistics
  const totalSchemes = await Scheme.count();
  const activeSchemes = await Scheme.count({ where: { is_active: true } });

  // UserScheme statistics
  const totalUserSchemes = await UserScheme.count();
  const userSchemesByStatus = await UserScheme.findAll({
    attributes: [
      'status',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const userSchemeStatusCounts = {
    ACTIVE: 0,
    COMPLETED: 0,
    WITHDRAWN: 0
  };

  userSchemesByStatus.forEach((status: any) => {
    const statusValue = status.dataValues.status as keyof typeof userSchemeStatusCounts;
    if (statusValue in userSchemeStatusCounts) {
      userSchemeStatusCounts[statusValue] = parseInt(status.dataValues.count, 10);
    }
  });

  // Transaction statistics
  const totalTransactions = await Transaction.count();
  
  // Calculate totalAmount separately
  const totalAmount = await Transaction.sum('amount', { 
    where: { 
      is_deleted: false 
    } 
  }) || 0;

  const totalGoldGrams = await Transaction.sum('goldGrams', { 
    where: { 
      is_deleted: false 
    } 
  }) || 0;
  
  const totalPoints = await Transaction.sum('points', { 
    where: { 
      is_deleted: false 
    } 
  }) || 0;

  const totalDeposits = await Transaction.sum('amount', { 
    where: { 
      transactionType: 'deposit',
      is_deleted: false 
    } 
  }) || 0;
  
  const totalWithdrawals = await Transaction.sum('amount', { 
    where: { 
      transactionType: { [Op.in]: ['withdrawal', 'bonus_withdrawal'] },
      is_deleted: false 
    } 
  }) || 0;

  const transactionTypeStats = await Transaction.findAll({
    attributes: [
      'transactionType',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
    ],
    group: ['transactionType']
  });

  const transactionsByType = {
    deposit: 0,
    withdrawal: 0,
    points: 0,
    bonus_withdrawal: 0
  };

  transactionTypeStats.forEach((type: any) => {
    const transactionType = type.dataValues.transactionType as keyof typeof transactionsByType;
    if (transactionType in transactionsByType) {
      transactionsByType[transactionType] = parseInt(type.dataValues.count, 10);
    }
  });

  // Gold price statistics
  const latestGoldPrice = await GoldPrice.findOne({
    where: { is_deleted: false },
    order: [['date', 'DESC']]
  });

  // Redemption statistics
  const totalRedemptions = await PointRedemption.count();
  const pendingRedemptions = await PointRedemption.count({ 
    where: { status: 'PENDING' } 
  });
  const approvedRedemptions = await PointRedemption.count({ 
    where: { status: 'APPROVED' } 
  });
  const rejectedRedemptions = await PointRedemption.count({ 
    where: { status: 'REJECTED' } 
  });
  const totalPointsRedeemed = await PointRedemption.sum('points', { 
    where: { status: 'APPROVED' } 
  }) || 0;

  // Combine all statistics
  return {
    userStats: {
      totalUsers,
      activeUsers,
      usersByStatus: {
        active: activeUsers,
        inactive: inactiveUsers
      }
    },
    schemeStats: {
      totalSchemes,
      activeSchemes
    },
    userSchemeStats: {
      totalUserSchemes,
      activeUserSchemes: userSchemeStatusCounts.ACTIVE,
      completedUserSchemes: userSchemeStatusCounts.COMPLETED,
      withdrawnUserSchemes: userSchemeStatusCounts.WITHDRAWN,
      userSchemesByStatus: userSchemeStatusCounts
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
      currentGoldPrice: latestGoldPrice?.pricePerGram || 0,
      lastUpdated: latestGoldPrice?.date || null
    },
    redemptionStats: {
      totalRequests: totalRedemptions,
      pendingRequests: pendingRedemptions,
      approvedRequests: approvedRedemptions,
      rejectedRequests: rejectedRedemptions,
      totalPointsRedeemed
    }
  };
}; 