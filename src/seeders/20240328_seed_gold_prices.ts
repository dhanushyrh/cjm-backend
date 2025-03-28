import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { subDays, format } from "date-fns";

export async function up(queryInterface: QueryInterface): Promise<void> {
  const today = new Date();
  const basePrice = 6000; // Base price in INR
  const prices = [];

  // Generate prices for last 5 days with small variations
  for (let i = 0; i < 5; i++) {
    const date = subDays(today, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    
    // Create random price variation between -100 to +100
    const variation = Math.floor(Math.random() * 200) - 100;
    const pricePerGram = basePrice + variation;

    prices.push({
      id: uuidv4(),
      date: formattedDate,
      pricePerGram: pricePerGram.toFixed(2),
      is_deleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  await queryInterface.bulkInsert("GoldPrices", prices);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const today = new Date();
  const dates = [];

  // Get dates for last 5 days
  for (let i = 0; i < 5; i++) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    dates.push(date);
  }

  await queryInterface.bulkDelete("GoldPrices", {
    date: dates
  });
} 