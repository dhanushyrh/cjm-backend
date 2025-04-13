/**
 * Generates a unique user ID in the format HS-XXXXXX where X is a digit
 * @returns {string} Formatted user ID
 */
export const generateUserId = (): string => {
  // Generate a random 6-digit number
  const randomNum = Math.floor(Math.random() * 1000000);
  
  // Pad with leading zeros to ensure it's 6 digits
  const paddedNum = randomNum.toString().padStart(6, '0');
  
  // Return the formatted user ID
  return `HS-${paddedNum}`;
};

/**
 * Checks if a user ID exists in the database
 * @param {string} userId - The user ID to check
 * @param {any} User - The User model
 * @returns {Promise<boolean>} True if the user ID exists, false otherwise
 */
export const userIdExists = async (userId: string, User: any): Promise<boolean> => {
  const count = await User.count({ where: { userId } });
  return count > 0;
};

/**
 * Generates a unique user ID that doesn't exist in the database
 * @param {any} User - The User model
 * @returns {Promise<string>} A unique user ID
 */
export const generateUniqueUserId = async (User: any): Promise<string> => {
  let userId: string;
  let exists: boolean;
  
  // Keep generating until we find a unique ID
  do {
    userId = generateUserId();
    exists = await userIdExists(userId, User);
  } while (exists);
  
  return userId;
}; 