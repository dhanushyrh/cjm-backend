import cron from "node-cron";
import { flushExpiredDailyTaskProofs } from "../services/dailyTaskProofFlushService";

/**
 * Delete daily-task proof images older than 30 days from the dedicated S3 bucket.
 * Runs daily at 04:00 Asia/Kolkata.
 */
export const startDailyTaskProofFlushScheduler = async () => {
  try {
    cron.schedule(
      "0 4 * * *",
      async () => {
        console.log("Flushing expired daily task proof images...");
        try {
          const result = await flushExpiredDailyTaskProofs();
          console.log("Daily task proof flush complete:", {
            timestamp: new Date().toISOString(),
            ...result,
          });
        } catch (error) {
          console.error("Daily task proof flush failed:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );
    console.log("Daily task proof flush scheduler started");
  } catch (error) {
    console.error("Failed to start daily task proof flush scheduler:", error);
  }
};
