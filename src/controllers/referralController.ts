import { Request, Response } from "express";
import { createReferral, updateReferralStatus, getReferrals, getReferralById } from "../services/referralService";
import { ReferralStatus } from "../models/Referral";
import { AuthRequest } from "../middleware/authMiddleware";

export const createReferralRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    const { name, age, email, phone, convenientDateTime, comments } = req.body;
    
    // Validation
    if (!name || !age || !email || !phone || !convenientDateTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide name, age, email, phone, and convenientDateTime."
      });
    }
    
    const referral = await createReferral(userId, {
      name,
      age: parseInt(age),
      email,
      phone,
      convenientDateTime: new Date(convenientDateTime),
      comments
    });

    return res.status(201).json({
      success: true,
      message: "Referral created successfully",
      data: referral
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create referral"
    });
  }
};

export const updateReferral = async (req: Request, res: Response) => {
  try {
    const { referralId } = req.params;
    const { status, isAddressed, comments } = req.body;

    if (!referralId) {
      return res.status(400).json({
        success: false,
        message: "Referral ID is required"
      });
    }

    if (!status || !Object.values(ReferralStatus).includes(status as ReferralStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values are: ${Object.values(ReferralStatus).join(", ")}`
      });
    }

    // Check if referral exists
    const referral = await getReferralById(referralId);
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found"
      });
    }

    await updateReferralStatus(
      referralId, 
      status as ReferralStatus,
      isAddressed !== undefined ? isAddressed : status !== ReferralStatus.PENDING,
      comments
    );

    return res.json({
      success: true,
      message: "Referral updated successfully"
    });
  } catch (error) {
    console.error("Error updating referral:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update referral"
    });
  }
};

export const getReferralList = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const status = req.query.status as ReferralStatus;
    const isAddressed = req.query.isAddressed !== undefined 
      ? req.query.isAddressed === 'true' 
      : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be greater than 0"
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100"
      });
    }

    const result = await getReferrals({
      userId,
      status,
      isAddressed,
      page,
      limit
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error getting referrals:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get referrals"
    });
  }
};

export const getReferralDetail = async (req: Request, res: Response) => {
  try {
    const { referralId } = req.params;
    
    if (!referralId) {
      return res.status(400).json({
        success: false,
        message: "Referral ID is required"
      });
    }
    
    const referral = await getReferralById(referralId);
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found"
      });
    }
    
    return res.json({
      success: true,
      data: referral
    });
  } catch (error) {
    console.error("Error getting referral details:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get referral details"
    });
  }
}; 