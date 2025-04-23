import { Op, Transaction } from "sequelize";
import UserScheme, { UserSchemeStatus } from "../models/UserScheme";
import User from "../models/User";
import Scheme from "../models/Scheme";
import Settings from "../models/Settings";
import PaymentDetails from "../models/PaymentDetails";
import { addMonths } from "date-fns";
import { createInitialDeposit, createTransaction } from "./transactionService";
import sequelize from "../config/database";
import { TransactionType } from "../models/Transaction";
import { getSetting } from "./settingsService";

export interface PaymentInfoType {
  payment_mode: string;
  payment_details: string;
  supporting_document_url?: string;
  amount: number;
  payment_date: Date;
}

export interface UserSchemeOptions {
  startDate?: Date;
  endDate?: Date;
  initialPoints?: number;
  status?: UserSchemeStatus;
  initialDeposit?: {
    amount: number;
    goldGrams: number;
    transactionType: string;
  };
}

export const createUserScheme = async (
  userId: string,
  schemeId: string,
  transaction?: Transaction,
  desired_item?: string,
  paymentInfo?: PaymentInfoType,
  options?: UserSchemeOptions
): Promise<{ userScheme: UserScheme; initialDeposit: any; bonusPoints?: number; paymentDetails?: PaymentDetails | null }> => {
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
    const joinBonusPoints = options?.initialPoints !== undefined ? options.initialPoints : 
      (joinBonusSetting ? parseInt(joinBonusSetting.value, 10) : 0);

    const startDate = options?.startDate || new Date();
    const endDate = options?.endDate || addMonths(startDate, scheme.duration);
    
    // Create payment details if provided
    let paymentDetailsRecord = null;
    if (paymentInfo) {
      try {
        paymentDetailsRecord = await PaymentDetails.create({
          payment_mode: paymentInfo.payment_mode,
          payment_details: paymentInfo.payment_details,
          supporting_document_url: paymentInfo.supporting_document_url || null,
          amount: paymentInfo.amount,
          payment_date: paymentInfo.payment_date
        }, { transaction: t });
        
        console.log("Created payment details:", paymentDetailsRecord.id);
        
        // If not using a transaction, we need to wait for the record to be fully committed
        if (!transaction) {
          await sequelize.query('SELECT * FROM "PaymentDetails" WHERE id = :id', { 
            replacements: { id: paymentDetailsRecord.id },
            transaction: t
          });
        }
      } catch (err: any) {
        console.error("Failed to create payment details:", err);
        throw new Error(`Failed to create payment details: ${err.message}`);
      }
    }
    
    // Create new user scheme mapping with bonus points
    const userScheme = await UserScheme.create({
      userId,
      schemeId,
      startDate,
      endDate,
      totalPoints: joinBonusPoints,
      availablePoints: joinBonusPoints,
      status: options?.status || "ACTIVE",
      desired_item: desired_item || null,
      accrued_gold: 0,
      payment_details_id: paymentDetailsRecord ? paymentDetailsRecord.id : null
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
    const initialDeposit = options?.initialDeposit ? 
      await createTransaction({
        userSchemeId: userScheme.id,
        transactionType: options.initialDeposit.transactionType as TransactionType || "deposit",
        amount: options.initialDeposit.amount,
        goldGrams: options.initialDeposit.goldGrams,
        points: 0,
        description: `Initial deposit for ${scheme.name} scheme`,
        transaction: t
      }).catch(err => {
        throw new Error(`Failed to create initial deposit: ${err.message}`);
      }) : 
      await createInitialDeposit(userScheme.id, t)
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
      bonusPoints: joinBonusPoints,
      paymentDetails: paymentDetailsRecord
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
  if (status === "WITHDRAWN") {
     // create a redeem request for the withdrawal
     
  }

  // Update status and set endDate to today
  return await userScheme.update({
    status,
    endDate: new Date()
  });
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

export const updateUserSchemeDesiredItem = async (
  userSchemeId: string,
  desired_item: string | null
) => {
  const userScheme = await UserScheme.findByPk(userSchemeId);
  if (!userScheme) {
    throw new Error("User scheme not found");
  }

  return await userScheme.update({ desired_item });
};

export const updateCertificateDeliveryStatus = async (
  userSchemeId: string,
  certificate_delivered: boolean
) => {
  const userScheme = await UserScheme.findByPk(userSchemeId);
  if (!userScheme) {
    throw new Error("User scheme not found");
  }

  return await userScheme.update({ certificate_delivered });
};

/**
 * Converts available points to gold and adds to accrued_gold
 * Resets available_points to 0
 * Used by the monthly cron job
 */
export const convertPointsToAccruedGold = async () => {
  try {
    // Get point value setting (how many gold grams per point)
    const pointConversionRate = await getSetting("point_conversion_rate");
    if (!pointConversionRate) {
      throw new Error("Point conversion rate setting not found");
    }
    
    const pointConversionValue = await getSetting("point_conversion_value");
    if (!pointConversionValue) {
      throw new Error("Point conversion value setting not found");
    }
    
    // Find all active user schemes with available points > 0
    const userSchemes = await UserScheme.findAll({
      where: {
        status: "ACTIVE",
        availablePoints: {
          [Op.gt]: 0
        }
      }
    });
    
    console.log(`Found ${userSchemes.length} user schemes with available points to convert`);
    
    const results = await Promise.all(
      userSchemes.map(async (userScheme) => {
        try {
          // Calculate gold grams from available points
          const goldGrams = (userScheme.availablePoints / parseInt(pointConversionRate)) * parseInt(pointConversionValue);
          
          // Update user scheme: add to accrued_gold, reset available_points
          await userScheme.update({
            accrued_gold: sequelize.literal(`COALESCE(accrued_gold, 0) + ${goldGrams}`),
            availablePoints: 0
          });
          
          return {
            userSchemeId: userScheme.id,
            pointsConverted: userScheme.availablePoints,
            goldGramsAdded: goldGrams,
            success: true
          };
        } catch (error) {
          console.error(`Error converting points for user scheme ${userScheme.id}:`, error);
          return {
            userSchemeId: userScheme.id,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );
    
    return {
      total: userSchemes.length,
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results
    };
  } catch (error) {
    console.error("Error in convertPointsToAccruedGold:", error);
    throw error;
  }
}; 