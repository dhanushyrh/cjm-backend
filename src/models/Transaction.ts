import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import UserScheme from "./UserScheme";
import GoldPrice from "./GoldPrice";

export type TransactionType = "deposit" | "withdrawal" | "points" | "bonus_withdrawal";

class Transaction extends Model {
  public id!: string;
  public userSchemeId!: string;
  public transactionType!: TransactionType;
  public amount!: number;
  public goldGrams!: number;
  public points!: number;
  public priceRefId?: string;
  public is_deleted!: boolean;
  public redeemReqId?: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly userScheme?: UserScheme;
  public readonly goldPrice?: GoldPrice;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userSchemeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "UserSchemes",
        key: "id",
      },
    },
    transactionType: {
      type: DataTypes.ENUM("deposit", "withdrawal", "points", "bonus_withdrawal"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    goldGrams: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    priceRefId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "GoldPrices",
        key: "id",
      },
    },
    redeemReqId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "RedemptionRequests",
        key: "id"
      }
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  },
  {
    sequelize,
    modelName: "Transaction",
  }
);

export default Transaction;
