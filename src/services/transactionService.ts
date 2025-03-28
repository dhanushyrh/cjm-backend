import Transaction from "../models/Transaction";

export const createTransaction = async (
  userId: string,
  schemeId: string,
  transactionType: "deposit" | "withdrawal" | "points",
  amount: number,
  goldGrams?: number,
  points?: number
) => {
  return await Transaction.create({ userId, schemeId, transactionType, amount, goldGrams, points });
};

export const getUserTransactions = async (userId: string) => {
  return await Transaction.findAll({ where: { userId } });
};

export const getTransactionsByScheme = async (schemeId: string) => {
    return await Transaction.findAll({ where: { schemeId } });
};    
  
export const deleteTransaction = async (id: string): Promise<boolean> => {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return false;

    await transaction.destroy();
    return true;
};