import { Transaction as SequelizeTransaction, Op } from "sequelize";
import Transaction, { TransactionType } from "../models/Transaction";
import UserScheme from "../models/UserScheme";
import Scheme from "../models/Scheme";
import User from "../models/User";
import GoldPrice from "../models/GoldPrice";

interface CreateTransactionParams {
  userSchemeId: string;
  transactionType: string;
  amount: number;
  goldGrams: number;
  points: number;
  priceRefId?: string;
  redeemReqId?: string;
  description?: string;
  transaction?: SequelizeTransaction;
}

interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalPoints: number;
  totalGoldGrams: number;
  transactionCount: {
    deposits: number;
    withdrawals: number;
    points: number;
    total: number;
  };
  lastTransaction?: {
    type: TransactionType;
    amount: number;
    goldGrams: number;
    points: number;
    date: Date;
  };
}

interface ExportableTransaction {
  transactionId: string;
  date: string;
  type: TransactionType;
  amount: number;
  goldGrams: number;
  points: number;
  userName: string;
  schemeName: string;
  userSchemeId: string;
}

interface TransactionExportSummary {
  totalAmount: number;
  totalGoldGrams: number;
  totalPoints: number;
  transactionCounts: {
    deposits: number;
    withdrawals: number;
    points: number;
    total: number;
  };
  schemeWiseSummary: {
    [schemeId: string]: {
      schemeName: string;
      totalAmount: number;
      totalGoldGrams: number;
      totalPoints: number;
      transactionCount: number;
    };
  };
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const createTransaction = async (params: CreateTransactionParams): Promise<Transaction> => {
  const { userSchemeId, transactionType, amount, goldGrams, points, priceRefId, description, transaction } = params;

  const newTransaction = await Transaction.create({
    userSchemeId,
    transactionType,
    amount,
    goldGrams,
    points,
    priceRefId,
    description,
    is_deleted: false
  }, { transaction });

  return newTransaction;
};

export const createInitialDeposit = async (
  userSchemeId: string,
  transaction?: SequelizeTransaction
): Promise<Transaction> => {
  // Get the user scheme with its associated scheme
  const userScheme = await UserScheme.findOne({
    where: { id: userSchemeId },
    include: [
      {
        model: Scheme,
        as: "scheme",
        required: true
      }
    ],
    transaction
  });

  if (!userScheme || !userScheme.scheme) {
    throw new Error("User scheme or scheme not found");
  }

  // Get the current gold price
  const currentGoldPrice = await GoldPrice.findOne({
    where: { is_deleted: false },
    order: [["date", "DESC"]],
    transaction
  });

  if (!currentGoldPrice) {
    throw new Error("Current gold price not found");
  }

  // Calculate the amount based on current gold price
  const amount = Number(userScheme.scheme.goldGrams) * Number(currentGoldPrice.pricePerGram);

  return createTransaction({
    userSchemeId,
    transactionType: "deposit",
    amount: amount,
    goldGrams: userScheme.scheme.goldGrams,
    points: 0,
    priceRefId: currentGoldPrice.id,
    description: `Initial deposit for ${userScheme.scheme.name} scheme`,
    transaction
  });
};

export const getUserTransactions = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<Transaction>> => {
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Transaction.findAndCountAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });
  
  const pages = Math.ceil(count / limit);
  
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages
    }
  };
};

export const getTransactionsByScheme = async (
  schemeId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<Transaction>> => {
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Transaction.findAndCountAll({
    where: { schemeId },
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });
  
  const pages = Math.ceil(count / limit);
  
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages
    }
  };
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
    const transaction = await Transaction.findByPk(id);
    if (!transaction || transaction.is_deleted) return false;

    // Soft delete the transaction by marking is_deleted as true
    await transaction.update({ is_deleted: true });
    return true;
};

export const getUserSchemeTransactions = async (
  userSchemeId: string,
  page: number = 1,
  limit: number = 10,
  type?: TransactionType
): Promise<{ transactions: Transaction[]; total: number }> => {
  const where: any = { 
    userSchemeId,
    is_deleted: false // Only include non-deleted transactions
  };
  
  if (type) {
    where.transactionType = type;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: [{
      model: UserScheme,
      as: "userScheme",
      include: [
        { model: User, as: "user" },
        { model: Scheme, as: "scheme" }
      ]
    }],
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return {
    transactions: rows,
    total: count
  };
};

export const getUserSchemeTransactionSummary = async (userSchemeId: string): Promise<TransactionSummary> => {
  const transactions = await Transaction.findAll({
    where: { 
      userSchemeId,
      is_deleted: false // Only include non-deleted transactions
    },
    order: [["createdAt", "DESC"]]
  });

  const summary: TransactionSummary = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalPoints: 0,
    totalGoldGrams: 0,
    transactionCount: {
      deposits: 0,
      withdrawals: 0,
      points: 0,
      total: transactions.length
    }
  };

  for (const transaction of transactions) {
    switch (transaction.transactionType) {
      case "deposit":
        summary.totalDeposits += Number(transaction.amount);
        summary.totalGoldGrams += Number(transaction.goldGrams);
        summary.transactionCount.deposits++;
        break;
      case "withdrawal":
        summary.totalWithdrawals += Number(transaction.amount);
        summary.totalGoldGrams -= Number(transaction.goldGrams);
        summary.transactionCount.withdrawals++;
        break;
      case "points":
        summary.totalPoints += transaction.points;
        summary.transactionCount.points++;
        break;
    }
  }

  if (transactions.length > 0) {
    const last = transactions[0];
    summary.lastTransaction = {
      type: last.transactionType,
      amount: Number(last.amount),
      goldGrams: Number(last.goldGrams),
      points: last.points,
      date: last.createdAt
    };
  }

  return summary;
};

export const getUserAllSchemesTransactions = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ transactions: Transaction[]; total: number }> => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Transaction.findAndCountAll({
    where: {
      is_deleted: false // Only include non-deleted transactions
    },
    include: [{
      model: UserScheme,
      as: "userScheme",
      where: { userId },
      include: [
        { model: User, as: "user" },
        { model: Scheme, as: "scheme" }
      ]
    }],
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return {
    transactions: rows,
    total: count
  };
};

export const getUserAllSchemesTransactionSummary = async (userId: string): Promise<{
  overallSummary: TransactionSummary;
  schemeWiseSummary: { [key: string]: TransactionSummary };
}> => {
  const transactions = await Transaction.findAll({
    where: {
      is_deleted: false // Only include non-deleted transactions
    },
    include: [{
      model: UserScheme,
      as: "userScheme",
      where: { userId },
      include: [{ model: Scheme, as: "scheme" }]
    }],
    order: [["createdAt", "DESC"]]
  });

  const overallSummary: TransactionSummary = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalPoints: 0,
    totalGoldGrams: 0,
    transactionCount: {
      deposits: 0,
      withdrawals: 0,
      points: 0,
      total: transactions.length
    }
  };

  const schemeWiseSummary: { [key: string]: TransactionSummary } = {};

  for (const transaction of transactions) {
    const schemeId = transaction.userScheme?.schemeId;
    if (!schemeId) continue;

    // Initialize scheme summary if not exists
    if (!schemeWiseSummary[schemeId]) {
      schemeWiseSummary[schemeId] = {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalPoints: 0,
        totalGoldGrams: 0,
        transactionCount: {
          deposits: 0,
          withdrawals: 0,
          points: 0,
          total: 0
        }
      };
    }

    // Update both overall and scheme-wise summaries
    const summaries = [overallSummary, schemeWiseSummary[schemeId]];
    summaries.forEach(summary => {
      switch (transaction.transactionType) {
        case "deposit":
          summary.totalDeposits += Number(transaction.amount);
          summary.totalGoldGrams += Number(transaction.goldGrams);
          summary.transactionCount.deposits++;
          break;
        case "withdrawal":
          summary.totalWithdrawals += Number(transaction.amount);
          summary.totalGoldGrams -= Number(transaction.goldGrams);
          summary.transactionCount.withdrawals++;
          break;
        case "points":
          summary.totalPoints += transaction.points;
          summary.transactionCount.points++;
          break;
      }
      summary.transactionCount.total++;
    });
  }

  if (transactions.length > 0) {
    const last = transactions[0];
    overallSummary.lastTransaction = {
      type: last.transactionType,
      amount: Number(last.amount),
      goldGrams: Number(last.goldGrams),
      points: last.points,
      date: last.createdAt
    };
  }

  return {
    overallSummary,
    schemeWiseSummary
  };
};

export const formatTransactionsForExport = async (
  transactions: Transaction[]
): Promise<ExportableTransaction[]> => {
  return transactions.map(transaction => ({
    transactionId: transaction.id,
    date: transaction.createdAt.toISOString().split('T')[0],
    type: transaction.transactionType,
    amount: Number(transaction.amount),
    goldGrams: Number(transaction.goldGrams),
    points: transaction.points,
    userName: transaction.userScheme?.user?.name || 'N/A',
    schemeName: transaction.userScheme?.scheme?.name || 'N/A',
    userSchemeId: transaction.userSchemeId
  }));
};

export const getExportableTransactions = async (
  userId?: string,
  userSchemeId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<ExportableTransaction[]> => {
  const where: any = {};
  
  if (userSchemeId) {
    where.userSchemeId = userSchemeId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = startDate;
    if (endDate) where.createdAt[Op.lte] = endDate;
  }

  const include: any = [{
    model: UserScheme,
    as: "userScheme",
    include: [
      { model: User, as: "user" },
      { model: Scheme, as: "scheme" }
    ]
  }];

  if (userId && !userSchemeId) {
    include[0].where = { userId };
  }

  const transactions = await Transaction.findAll({
    where,
    include,
    order: [["createdAt", "DESC"]]
  });

  return formatTransactionsForExport(transactions);
};

export const calculateExportSummary = async (transactions: ExportableTransaction[]): Promise<TransactionExportSummary> => {
  // Calculate overall totals
  let totalAmount = 0;
  let totalGoldGrams = 0;
  let totalPoints = 0;
  
  // Track transaction counts
  const transactionCounts = {
    deposits: 0,
    withdrawals: 0,
    points: 0,
    total: transactions.length
  };
  
  // Initialize scheme-wise summary
  const schemeWiseSummary: TransactionExportSummary["schemeWiseSummary"] = {};
  
  // Process each transaction
  transactions.forEach(t => {
    // Update transaction type counts
    if (t.type === "deposit") {
      transactionCounts.deposits++;
      totalAmount += t.amount;
      totalGoldGrams += t.goldGrams;
    } else if (t.type === "withdrawal") {
      transactionCounts.withdrawals++;
      totalAmount -= t.amount;
      totalGoldGrams -= t.goldGrams;
    } else if (t.type === "points") {
      transactionCounts.points++;
    }
    
    // Add points for all transaction types
    totalPoints += t.points;
    
    // Initialize or update scheme summary
    const schemeKey = `${t.schemeName}_${t.userSchemeId}`;
    if (!schemeWiseSummary[schemeKey]) {
      schemeWiseSummary[schemeKey] = {
        schemeName: t.schemeName,
        totalAmount: 0,
        totalGoldGrams: 0,
        totalPoints: 0,
        transactionCount: 0
      };
    }
    
    // Update scheme summary
    const schemeSummary = schemeWiseSummary[schemeKey];
    schemeSummary.transactionCount++;
    if (t.type === "deposit") {
      schemeSummary.totalAmount += t.amount;
      schemeSummary.totalGoldGrams += t.goldGrams;
    } else if (t.type === "withdrawal") {
      schemeSummary.totalAmount -= t.amount;
      schemeSummary.totalGoldGrams -= t.goldGrams;
    }
    schemeSummary.totalPoints += t.points;
  });
  return {
    totalAmount,
    totalGoldGrams,
    totalPoints,
    transactionCounts,
    schemeWiseSummary
  };
};