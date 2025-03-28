import { Op, Transaction } from "sequelize";
import UserScheme, { UserSchemeStatus } from "../models/UserScheme";
import User from "../models/User";
import Scheme from "../models/Scheme";
import { addMonths } from "date-fns";

export const createUserScheme = async (
  userId: string,
  schemeId: string,
  transaction?: Transaction
) => {
  // Check if user already has an active scheme
  const existingScheme = await UserScheme.findOne({
    where: {
      userId,
      status: "ACTIVE"
    },
    transaction
  });

  if (existingScheme) {
    throw new Error("User already has an active scheme");
  }

  // Get scheme details to calculate end date
  const scheme = await Scheme.findByPk(schemeId, { transaction });
  if (!scheme) {
    throw new Error("Invalid scheme ID");
  }

  const startDate = new Date();
  const endDate = addMonths(startDate, scheme.duration);

  // Create new user scheme mapping
  const userScheme = await UserScheme.create({
    userId,
    schemeId,
    startDate,
    endDate,
    totalPoints: 0,
    status: "ACTIVE"
  }, { transaction });

  return userScheme;
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