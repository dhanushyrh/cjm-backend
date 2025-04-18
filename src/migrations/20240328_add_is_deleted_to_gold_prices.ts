import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    // Add unique index for active gold prices if it doesn't exist
    await queryInterface.addIndex("GoldPrices", ["date"], {
      unique: true,
      where: {
        is_deleted: false
      },
      name: "unique_active_gold_price_per_date"
    });
  } catch (error: any) {
    // If error is not about duplicate index, rethrow it
    if (!error.message.includes("already exists")) {
      throw error;
    }
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  try {
    await queryInterface.removeIndex("GoldPrices", "unique_active_gold_price_per_date");
  } catch (error: any) {
    // If error is not about missing index, rethrow it
    if (!error.message.includes("does not exist")) {
      throw error;
    }
  }
} 