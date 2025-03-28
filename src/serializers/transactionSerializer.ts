import Transaction from "../models/Transaction";

export interface TransactionSerializer {
  id: string;
  userId: string;
  schemeId: string;
  transactionType: string;
  amount: number;
  goldGrams: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export const serializeTransaction = (transaction: Transaction): TransactionSerializer => {
  return transaction.toJSON();
};

export const serializeTransactions = (transactions: Transaction[]): TransactionSerializer[] => {
  return transactions.map(transaction => serializeTransaction(transaction));
}; 