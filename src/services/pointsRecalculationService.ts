import { Op } from "sequelize";
import UserScheme from "../models/UserScheme";
import Transaction, { TransactionType } from "../models/Transaction";
import Scheme from "../models/Scheme";

interface UserSchemeWithAssociations extends UserScheme {
  transactions?: Transaction[];
  scheme?: Scheme;
}

export const recalculateUserSchemePoints = async () => {
  try {
    // Get all active user schemes with their transactions
    const activeUserSchemes = await UserScheme.findAll({
      where: { 
        status: "ACTIVE"
      },
      include: [
        {
          model: Transaction,
          as: "transactions",
          where: { is_deleted: false },
          required: false
        },
        {
          model: Scheme,
          as: "scheme",
          required: true
        }
      ]
    }) as UserSchemeWithAssociations[];

    const updates = await Promise.all(
      activeUserSchemes.map(async (userScheme) => {
        try {
          // Calculate total points from transactions
          const totalPoints = userScheme.transactions?.reduce((sum: number, transaction: Transaction) => {
            return sum + (transaction.points || 0);
          }, 0) || 0;

          // Update user scheme with calculated points
          await userScheme.update({
            availablePoints: totalPoints
          });

          return {
            userSchemeId: userScheme.id,
            previousPoints: userScheme.availablePoints,
            newPoints: totalPoints,
            success: true
          };
        } catch (error) {
          console.error(`Failed to update points for userScheme ${userScheme.id}:`, error);
          return {
            userSchemeId: userScheme.id,
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
          };
        }
      })
    );

    const successCount = updates.filter(u => u.success).length;
    const failureCount = updates.filter(u => !u.success).length;

    return {
      totalProcessed: updates.length,
      successCount,
      failureCount,
      details: updates
    };
  } catch (error) {
    console.error("Points recalculation error:", error);
    throw error;
  }
}; 