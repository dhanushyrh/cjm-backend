import { Op } from "sequelize";
import SchemeRequest from "../models/SchemeRequest";
import User from "../models/User";
import sequelize from "../config/database";

/**
 * Creates a new scheme request
 */
export const createSchemeRequest = async (
  userId: string,
  desired_gold_grams: number,
  desired_item: string,
  convenient_time: string,
  comments: string | null
) => {
  try {
    return await SchemeRequest.create({
      userId,
      desired_gold_grams,
      desired_item,
      convenient_time,
      comments,
      is_addressed: false
    });
  } catch (error) {
    console.error("Error creating scheme request:", error);
    throw error;
  }
};

/**
 * Get all scheme requests for a specific user
 */
export const getUserSchemeRequests = async (userId: string) => {
  try {
    return await SchemeRequest.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]]
    });
  } catch (error) {
    console.error("Error getting user scheme requests:", error);
    throw error;
  }
};

/**
 * Get a single scheme request by id
 */
export const getSchemeRequestById = async (id: string) => {
  try {
    return await SchemeRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "mobile"]
        }
      ]
    });
  } catch (error) {
    console.error(`Error getting scheme request with id ${id}:`, error);
    throw error;
  }
};

/**
 * Get all scheme requests with pagination and optional filters
 */
export const getAllSchemeRequests = async (
  page: number = 1,
  limit: number = 10,
  addressedStatus?: boolean
) => {
  try {
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {};
    if (addressedStatus !== undefined) {
      where.is_addressed = addressedStatus;
    }
    
    const { count, rows } = await SchemeRequest.findAndCountAll({
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
      offset
    });
    
    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows
    };
  } catch (error) {
    console.error("Error getting all scheme requests:", error);
    throw error;
  }
};

/**
 * Update a scheme request (admin only)
 */
export const updateSchemeRequest = async (
  id: string,
  updates: {
    is_addressed?: boolean;
    comments?: string;
  }
) => {
  try {
    const request = await SchemeRequest.findByPk(id);
    
    if (!request) {
      throw new Error("Scheme request not found");
    }
    
    return await request.update(updates);
  } catch (error) {
    console.error(`Error updating scheme request with id ${id}:`, error);
    throw error;
  }
}; 