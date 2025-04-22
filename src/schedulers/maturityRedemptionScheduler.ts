import cron from "node-cron";
import { Op } from "sequelize";
import UserScheme from "../models/UserScheme";
import RedemptionRequest from "../models/RedemptionRequest";
import { getSetting } from "../services/settingsService";
import sequelize from "../config/database";
import Scheme from "../models/Scheme";

/**
 * Scheduler to create MATURITY redemption requests for schemes that have reached maturity
 * Runs at 1 AM every day to check for matured schemes
 */
export const startMaturityRedemptionScheduler = async () => {
  try {
    console.log("Starting maturity redemption scheduler...");
    
    // Schedule job to run at 1 AM every day
    cron.schedule("0 23 * * *", async () => {
      console.log("Checking for matured schemes...");
      try {
        const result = await createMaturityRedemptionRequests();
        console.log("Maturity redemption requests created:", {
          timestamp: new Date().toISOString(),
          ...result
        });
      } catch (error) {
        console.error("Failed to create maturity redemption requests:", error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // Adjust timezone as needed
    });
    
    console.log("Maturity redemption scheduler started");
  } catch (error) {
    console.error("Failed to start maturity redemption scheduler:", error);
  }
};

/**
 * Creates redemption requests for schemes that have reached maturity
 * Includes total gold amount (scheme grams + accrued gold)
 */
export const createMaturityRedemptionRequests = async () => {
  const t = await sequelize.transaction();
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all active schemes that have reached their end date
    const maturedSchemes = await UserScheme.findAll({
      where: {
        status: "ACTIVE",
        endDate: {
          [Op.lte]: today
        }
      },
      include: [
        {
          model: Scheme,
          as: 'scheme',
          attributes: ['id', 'name', 'goldGrams']
        }
      ],
      transaction: t
    });
    
    console.log(`Found ${maturedSchemes.length} matured schemes`);
    
    if (maturedSchemes.length === 0) {
      await t.commit();
      return {
        total: 0,
        processed: 0,
        skipped: 0,
        details: []
      };
    }
    
    const results = await Promise.all(
      maturedSchemes.map(async (userScheme) => {
        try {
          // Check if a MATURITY redemption request already exists for this scheme
          const existingRequest = await RedemptionRequest.findOne({
            where: {
              userSchemeId: userScheme.id,
              type: "MATURITY",
              is_deleted: false
            },
            transaction: t
          });
          
          if (existingRequest) {
            return {
              userSchemeId: userScheme.id,
              success: false,
              skipped: true,
              message: "Maturity redemption request already exists"
            };
          }
          
          // Calculate total gold (scheme grams + accrued gold)
          const schemeGrams = userScheme.scheme?.goldGrams || 0;
          const accruedGold = userScheme.accrued_gold || 0;
          const totalGold = Number(schemeGrams) + Number(accruedGold);
          
          // Create redemption request
          const redemptionRequest = await RedemptionRequest.create({
            userSchemeId: userScheme.id,
            type: "MATURITY",
            status: "PENDING",
            remarks: `Automatic maturity redemption for ${totalGold.toFixed(2)} grams of gold (${schemeGrams} scheme grams + ${accruedGold.toFixed(2)} accrued gold)`
          }, { transaction: t });
          
          return {
            userSchemeId: userScheme.id,
            redemptionRequestId: redemptionRequest.id,
            schemeGrams,
            accruedGold,
            totalGold,
            success: true
          };
        } catch (error) {
          console.error(`Error creating maturity redemption for user scheme ${userScheme.id}:`, error);
          return {
            userSchemeId: userScheme.id,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );
    
    await t.commit();
    
    return {
      total: maturedSchemes.length,
      processed: results.filter(r => r.success).length,
      skipped: results.filter(r => r.skipped).length,
      failed: results.filter(r => !r.success && !r.skipped).length,
      details: results
    };
  } catch (error) {
    await t.rollback();
    console.error("Error in createMaturityRedemptionRequests:", error);
    throw error;
  }
};