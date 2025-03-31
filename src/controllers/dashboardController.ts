import { Request, Response } from "express";
import { getDashboardStats } from "../services/dashboardService";

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const stats = await getDashboardStats();
    
    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      data: stats
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ 
      error: "Failed to fetch dashboard statistics",
      details: error.message
    });
  }
}; 