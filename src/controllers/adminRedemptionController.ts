import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { approveRedemption, getAllRedemptionRequests } from "../services/pointRedemptionService";
import { RedemptionStatus } from "../models/RedemptionRequest";
import { convertPointsToAccruedGold } from "../services/userSchemeService";

// Get all redemption requests with optional filters
export const getRedemptionRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const requests = await getAllRedemptionRequests({
      status: status as RedemptionStatus,
      page: Number(page),
      limit: Number(limit)
    });

    return res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error("Error fetching redemption requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch redemption requests"
    });
  }
};

// Approve or reject a redemption request
export const updateRedemptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status, remarks } = req.body;
    
    if (!requestId || !status || !["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request parameters"
      });
    }

    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated"
      });
    }

    const updatedRequest = await approveRedemption(requestId, adminId, remarks, status as RedemptionStatus);

    return res.json({
      success: true,
      message: `Redemption request ${status.toLowerCase()}`,
      data: updatedRequest
    });
  } catch (error) {
    console.error("Error updating redemption request:", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update redemption request"
    });
  }
}; 

// Trigger gold accrual
export const triggerGoldAccrual = async (req: AuthRequest, res: Response) => {
  try {
    const result = await convertPointsToAccruedGold();
    return res.json({
      success: true,
      message: "Gold accrual triggered",
      data: result
    });
  }
  catch(error){
    console.error("Error triggering gold accrual:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to trigger gold accrual"
    });
  }
};