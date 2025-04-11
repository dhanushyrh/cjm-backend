import { Op, Transaction } from "sequelize";
import UserScheme, { UserSchemeStatus } from "../models/UserScheme";
import User from "../models/User";
import Scheme from "../models/Scheme";
import Settings from "../models/Settings";
import { addMonths } from "date-fns";
import { createInitialDeposit, createTransaction } from "./transactionService";
import sequelize from "../config/database";

export const createUserScheme = async (
  userId: string,
  schemeId: string,
  transaction?: Transaction
): Promise<{ userScheme: UserScheme; initialDeposit: any; bonusPoints?: number }> => {
  // Create a transaction if not provided
  const t = transaction || await sequelize.transaction();
  
  try {
    // Validate inputs
    if (!userId || !schemeId) {
      throw new Error("User ID and Scheme ID are required");
    }
    
    // Check if user exists
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new Error("User not found");
    }
  
    
    // Get scheme details to calculate end date
    const scheme = await Scheme.findByPk(schemeId, { transaction: t });
    if (!scheme) {
      throw new Error("Invalid scheme ID");
    }

    // Get join bonus points from settings
    const joinBonusSetting = await Settings.findOne({
      where: { 
        key: 'join_bonus_point',
        is_deleted: false
      },
      transaction: t
    });

    // Default to 0 if setting not found
    const joinBonusPoints = joinBonusSetting ? parseInt(joinBonusSetting.value, 10) : 0;

    const startDate = new Date();
    const endDate = addMonths(startDate, scheme.duration);
    
    // Create new user scheme mapping with bonus points
    const userScheme = await UserScheme.create({
      userId,
      schemeId,
      startDate,
      endDate,
      totalPoints: joinBonusPoints,
      availablePoints: joinBonusPoints,
      status: "ACTIVE"
    }, { transaction: t })
    .catch(err => {
      // Provide more specific error messages for validation errors
      if (err.name === 'SequelizeValidationError') {
        const validationErrors = err.errors.map((e: any) => e.message).join(', ');
        throw new Error(`Validation error: ${validationErrors}`);
      }
      throw err;
    });
    
    // Create initial deposit transaction
    const initialDeposit = await createInitialDeposit(userScheme.id, t)
    .catch(err => {
      throw new Error(`Failed to create initial deposit: ${err.message}`);
    });
    
    // Create bonus points transaction if there are any bonus points
    let bonusTransaction = null;
    if (joinBonusPoints > 0) {
      bonusTransaction = await createTransaction({
        userSchemeId: userScheme.id,
        transactionType: "points",
        amount: 0, // No amount for bonus points
        goldGrams: 0, // No gold grams for bonus points
        points: joinBonusPoints,
        description: `Join bonus points ${joinBonusPoints} awarded for joining ${scheme.name} scheme`,
        transaction: t
      }).catch(err => {
        throw new Error(`Failed to create bonus points transaction: ${err.message}`);
      });
    }
    
    // Commit transaction if we started it
    if (!transaction) {
      await t.commit();
    }
    
    return { 
      userScheme, 
      initialDeposit,
      bonusPoints: joinBonusPoints
    };
  } catch (error) {
    // Rollback transaction if we started it
    if (!transaction) {
      await t.rollback();
    }
    
    // Rethrow with more context
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Failed to create user scheme: ${error}`);
    }
  }
};

export const getUserSchemes = async (userId: string) => {
  return await UserScheme.findAll({
    where: { userId },
    include: [
      {
        model: Scheme,
        as: "scheme"
      }
    ],
    order: [["createdAt", "DESC"]]
  });
};

export const getActiveUserScheme = async (userId: string, schemeId: string) => {
  return await UserScheme.findOne({
    where: {
      userId,
      schemeId,
      status: "ACTIVE"
    },
    include: [
      {
        model: Scheme,
        as: "scheme"
      }
    ]
  });
};

export const updateUserSchemeStatus = async (
  userSchemeId: string,
  status: UserSchemeStatus
) => {
  const userScheme = await UserScheme.findByPk(userSchemeId);
  if (!userScheme) {
    throw new Error("User scheme not found");
  }

  return await userScheme.update({ status });
};

export const updateUserSchemePoints = async (
  userSchemeId: string,
  points: number
) => {
  const userScheme = await UserScheme.findByPk(userSchemeId);
  if (!userScheme) {
    throw new Error("User scheme not found");
  }

  return await userScheme.update({
    totalPoints: userScheme.totalPoints + points
  });
};

export const getExpiredSchemes = async () => {
  const today = new Date();
  return await UserScheme.findAll({
    where: {
      status: "ACTIVE",
      endDate: {
        [Op.lt]: today
      }
    },
    include: [
      {
        model: User,
        as: "user"
      },
      {
        model: Scheme,
        as: "scheme"
      }
    ]
  });
}; 