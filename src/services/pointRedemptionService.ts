import { Transaction as SequelizeTransaction } from "sequelize";
import UserScheme from "../models/UserScheme";
import Settings from "../models/Settings";
import RedemptionRequest, { RedemptionStatus, RedemptionType } from "../models/RedemptionRequest";
import { createTransaction } from "./transactionService";
import Transaction from "../models/Transaction";
import db from "../config/database";
import User from "../models/User";
import Scheme from "../models/Scheme";

interface RedemptionEligibility {
  isEligible: boolean;
  reason?: string;
  availablePoints: number;
  minimumPoints: number;
  pointsNeeded?: number;
}

export const checkRedemptionEligibility = async (userSchemeId: string): Promise<RedemptionEligibility> => {
  try {
    // Get minimum points requirement from settings
    const minPointsSetting = await Settings.findOne({
      where: {
        key: "minimumRedemptionPoints",
        is_deleted: false
      }
    });

    // Use setting value or default to 100 if not found
    const minimumPoints = minPointsSetting ? parseInt(minPointsSetting.value) : 100;
    if (!minPointsSetting) {
      console.warn("minimumRedemptionPoints setting not found, using default value of 100");
    }

    // Get user scheme
    const userScheme = await UserScheme.findByPk(userSchemeId);
    if (!userScheme) {
      throw new Error("User scheme not found");
    }

    // Check if scheme is active
    if (userScheme.status !== "ACTIVE") {
      return {
        isEligible: false,
        reason: `Scheme is not active (current status: ${userScheme.status})`,
        availablePoints: userScheme.availablePoints,
        minimumPoints
      };
    }

    // Check if there are enough points to redeem
    if (userScheme.availablePoints < minimumPoints) {
      return {
        isEligible: false,
        reason: "Insufficient points for redemption",
        availablePoints: userScheme.availablePoints,
        minimumPoints,
        pointsNeeded: minimumPoints - userScheme.availablePoints
      };
    }

    // Check if there's already a pending request
    const pendingRequest = await RedemptionRequest.findOne({
      where: {
        userSchemeId,
        status: "PENDING",
        type: "BONUS",
        is_deleted: false
      }
    });

    if (pendingRequest) {
      return {
        isEligible: false,
        reason: "There is already a pending redemption request",
        availablePoints: userScheme.availablePoints,
        minimumPoints
      };
    }

    return {
      isEligible: true,
      availablePoints: userScheme.availablePoints,
      minimumPoints
    };
  } catch (error) {
    console.error("Error checking redemption eligibility:", error);
    throw error;
  }
};

export const createRedemptionRequest = async (
  userSchemeId: string,
  pointsToRedeem: number,
  transaction?: SequelizeTransaction
): Promise<RedemptionRequest> => {
  try {
    // Check eligibility
    const eligibility = await checkRedemptionEligibility(userSchemeId);
    if (!eligibility.isEligible) {
      throw new Error(eligibility.reason);
    }

    if (pointsToRedeem > eligibility.availablePoints) {
      throw new Error(`Cannot redeem ${pointsToRedeem} points. Only ${eligibility.availablePoints} points available.`);
    }

    if (pointsToRedeem < eligibility.minimumPoints) {
      throw new Error(`Minimum redemption amount is ${eligibility.minimumPoints} points.`);
    }

    // Create redemption request
    const request = await RedemptionRequest.create({
      userSchemeId,
      type: "BONUS",
      points: pointsToRedeem,
      status: "PENDING"
    }, { transaction });

    return request;
  } catch (error) {
    console.error("Error creating redemption request:", error);
    throw error;
  }
};

export const approveRedemption = async (
  requestId: string,
  adminId: string,
  remarks: string,
  status: RedemptionStatus
) => {
  const t = await db.transaction();

  try {
    const request = await RedemptionRequest.findByPk(requestId, { transaction: t });
    if (!request || !request.points) {
      throw new Error("Redemption request not found or invalid points");
    }

    if (request.status !== "PENDING") {
      throw new Error("Can only process pending requests");
    }

    // Update request status
    await request.update(
      {
        status,
        adminId,
        remarks,
        processedAt: new Date()
      },
      { transaction: t }
    );

    if (status === "APPROVED") {
      // Create bonus withdrawal transaction
      await createTransaction({
        userSchemeId: request.userSchemeId,
        transactionType: "bonus_withdrawal",
        amount: 0, // No amount for bonus withdrawals
        goldGrams: 0,
        points: -request.points, // Negative points for withdrawal
        redeemReqId: requestId
      });

      // Update user scheme points
      await UserScheme.decrement(
        { availablePoints: request.points },
        { 
          where: { id: request.userSchemeId },
          transaction: t 
        }
      );
    } else if (status === "REJECTED") {
      // Soft delete any existing bonus withdrawal transaction
      await Transaction.update(
        { is_deleted: true },
        {
          where: {
            redeemReqId: requestId,
            transactionType: "bonus_withdrawal",
            is_deleted: false
          },
          transaction: t
        }
      );
    }

    await t.commit();
    return request;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

interface GetRedemptionRequestsParams {
  status?: RedemptionStatus;
  page?: number;
  limit?: number;
}

export const getAllRedemptionRequests = async ({
  status,
  page = 1,
  limit = 10
}: GetRedemptionRequestsParams) => {
  const offset = (page - 1) * limit;
  
  const where: any = { is_deleted: false };
  if (status) {
    where.status = status;
  }

  const { count, rows } = await RedemptionRequest.findAndCountAll({
    where,
    include: [
      {
        model: UserScheme,
        as: "userScheme",
        attributes: ["id", "userId", "schemeId", "availablePoints"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"]
          }
        ]
      }
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return {
    requests: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

export const getUserRedemptionRequests = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;
  
  // Find all userSchemes for this user
  const userSchemes = await UserScheme.findAll({
    where: { userId, is_deleted: false },
    attributes: ['id']
  });
  
  // Get the IDs of all user schemes
  const userSchemeIds = userSchemes.map(scheme => scheme.id);
  
  if (userSchemeIds.length === 0) {
    return {
      requests: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0
      }
    };
  }
  
  const { count, rows } = await RedemptionRequest.findAndCountAll({
    where: {
      userSchemeId: userSchemeIds,
      is_deleted: false
    },
    include: [
      {
        model: UserScheme,
        as: "userScheme",
        attributes: ["id", "schemeId", "availablePoints", "desired_item"],
        include: [
          {
            model: Scheme,
            as: "scheme",
            attributes: ["id", "name", "duration", "goldGrams"]
          }
        ]
      }
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return {
    requests: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};