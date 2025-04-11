/**
 * Calculates points based on gold price, amount, and scheme's gold grams
 * @param amount - Amount in rupees
 * @param goldPrice - Current gold price per gram
 * @param schemeGoldGrams - Total gold grams in the scheme
 * @returns Number of points earned
 */
export const calculatePoints = (amount: number, goldPrice: number, schemeGoldGrams: number): number => {
  // Calculate grams of gold based on amount and current price
  const goldGrams = amount / goldPrice;
  
  // Calculate points based on ratio of purchased grams to scheme's total grams
  const points = Math.floor((goldGrams / schemeGoldGrams) * 100);
  
  return points;
}; 