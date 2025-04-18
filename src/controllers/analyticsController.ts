import { Request, Response } from 'express';
import { getAnalytics } from '../services/analyticsService';

/**
 * Get comprehensive analytics data
 */
export const getAnalyticsData = async (req: Request, res: Response): Promise<void> => {
  try {
    const analyticsData = await getAnalytics();
    
    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error: any) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics data'
    });
  }
}; 