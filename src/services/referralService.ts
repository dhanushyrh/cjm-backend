import Referral, { ReferralStatus } from "../models/Referral";
import User from "../models/User";
import { Op } from "sequelize";

interface CreateReferralData {
  name: string;
  age: number;
  email: string;
  phone: string;
  convenientDateTime: Date;
  comments?: string;
}

export const createReferral = async (
  userId: string,
  data: CreateReferralData
) => {
  return await Referral.create({
    ...data,
    userId,
    status: ReferralStatus.PENDING,
    isAddressed: false,
  });
};

export const updateReferralStatus = async (
  referralId: string,
  status: ReferralStatus,
  isAddressed: boolean = status !== ReferralStatus.PENDING,
  comments?: string
) => {
  const updateData: any = {
    status,
    isAddressed
  };

  if (comments !== undefined) {
    updateData.comments = comments;
  }

  return await Referral.update(
    updateData,
    {
      where: { id: referralId },
    }
  );
};

export const getReferralById = async (referralId: string) => {
  return await Referral.findByPk(referralId, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "mobile"]
      }
    ]
  });
};

interface GetReferralsParams {
  userId?: string;
  status?: ReferralStatus;
  isAddressed?: boolean;
  page?: number;
  limit?: number;
}

export const getReferrals = async ({
  userId,
  status,
  isAddressed,
  page = 1,
  limit = 10
}: GetReferralsParams) => {
  const offset = (page - 1) * limit;
  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (status) {
    where.status = status;
  }

  if (isAddressed !== undefined) {
    where.isAddressed = isAddressed;
  }

  const { count, rows } = await Referral.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "mobile"]
      }
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    referrals: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
}; 