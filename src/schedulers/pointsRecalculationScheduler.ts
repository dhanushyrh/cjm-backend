import cron from "node-cron";
import { recalculateUserSchemePoints } from "../services/pointsRecalculationService";

export const startPointsRecalculationScheduler = () => {
  // Schedule job to run at 2 AM every day
  cron.schedule("0 2 * * *", async () => {
    console.log("Starting daily points recalculation...");
    try {
      const result = await recalculateUserSchemePoints();
      console.log("Points recalculation completed:", {
        timestamp: new Date().toISOString(),
        ...result
      });
    } catch (error) {
      console.error("Points recalculation failed:", error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });

  console.log("Points recalculation scheduler started");
}; 