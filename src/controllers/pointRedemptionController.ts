import { Request, Response } from "express";
import { checkRedemptionEligibility, createRedemptionRequest } from "../services/pointRedemptionService";
import UserScheme from "../models/UserScheme";
import { AuthRequest } from "../middleware/authMiddleware";

// Check if user can redeem points
export const checkEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { userSchemeId } = req.params;

    // Verify user owns this scheme
    const userScheme = await UserScheme.findOne({
      where: {
        id: userSchemeId,
        userId: req.user?.id
      }
    });

    if (!userScheme) {
      return res.status(404).json({
        success: false,
        message: "User scheme not found or unauthorized"
      });
    }

    const eligibility = await checkRedemptionEligibility(userSchemeId);

    return res.json({
      success: true,
      data: {
        ...eligibility,
        userSchemeId
      }
    });
  } catch (error) {
    console.error("Error checking redemption eligibility:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check redemption eligibility"
    });
  }
};

// Redeem points
export const redeemUserPoints = async (req: AuthRequest, res: Response) => {
  try {
    const { userSchemeId } = req.params;
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid points value"
      });
    }

    // Verify user owns this scheme
    const userScheme = await UserScheme.findOne({
      where: {
        id: userSchemeId,
        userId: req.user?.id
      }
    });

    if (!userScheme) {
      return res.status(404).json({
        success: false,
        message: "User scheme not found or unauthorized"
      });
    }

    const request = await createRedemptionRequest(userSchemeId, points);

    return res.json({
      success: true,
      message: `Successfully created redemption request for ${points} points`,
      data: {
        requestId: request.id,
        userSchemeId,
        pointsRequested: points,
        status: request.status
      }
    });
  } catch (error) {
    console.error("Error creating redemption request:", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create redemption request"
    });
  }
};