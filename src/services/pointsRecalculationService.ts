import UserScheme from "../models/UserScheme";
import Transaction, { TransactionType } from "../models/Transaction";
import Scheme from "../models/Scheme";

interface UserSchemeWithAssociations extends UserScheme {
  transactions?: Transaction[];
  scheme?: Scheme;
}

export const recalculateUserSchemePoints = async (batchSize = 100) => {
  try {
    // Get total count of active user schemes
    const totalCount = await UserScheme.count({
      where: { status: "ACTIVE" }
    });
    
    const batchCount = Math.ceil(totalCount / batchSize);
    const updates = [];
    
    // Process in batches
    for (let batch = 0; batch < batchCount; batch++) {
      const offset = batch * batchSize;
      
      // Get batch of user schemes
      const userSchemes = await UserScheme.findAll({
        where: { status: "ACTIVE" },
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
        ],
        limit: batchSize,
        offset
      }) as UserSchemeWithAssociations[];
      
      // Process batch
      const batchUpdates = await Promise.all(
        userSchemes.map(async (userScheme) => {
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
      
      updates.push(...batchUpdates);
    }
    
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