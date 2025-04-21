import cron from "node-cron";
import { convertPointsToAccruedGold } from "../services/userSchemeService";
import { getSetting } from "../services/settingsService";

/**
 * Scheduler to convert available points to accrued gold
 * Runs at 3 AM on the day after redemption window closes each month
 */
export const startGoldAccrualScheduler = async () => {
  try {
    // Get redemption window day setting (default to 15 if not set)
    const redemptionWindowDayStr = await getSetting("redemptionWindow");
    const redemptionWindowDay = redemptionWindowDayStr ? parseInt(redemptionWindowDayStr) : 10;
    
    // Calculate the day after redemption window (handle edge case for month end)
    let dayAfterWindow = redemptionWindowDay + 1;
    if (dayAfterWindow > 28) {
      // Use 1st of next month if redemption window is at month end
      // This ensures the job will always run in all months (including February)
      dayAfterWindow = 1;
    }
    
    console.log(`Gold accrual scheduled to run at 3 AM on day ${dayAfterWindow} of each month`);
    
    // Schedule job to run at 3 AM on the day after redemption window
    cron.schedule(`0 3 ${dayAfterWindow} * *`, async () => {
      console.log("Starting monthly points to gold conversion...");
      try {
        const result = await convertPointsToAccruedGold();
        console.log("Points to gold conversion completed:", {
          timestamp: new Date().toISOString(),
          ...result
        });
      } catch (error) {
        console.error("Points to gold conversion failed:", error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // Adjust timezone as needed
    });
    
    console.log("Gold accrual scheduler started");
  } catch (error) {
    console.error("Failed to start gold accrual scheduler:", error);
  }
}; 