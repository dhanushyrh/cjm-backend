import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Transaction extends Model {
  public id!: string;
  public userId!: string;
  public schemeId!: string;
  public transactionType!: "deposit" | "withdrawal" | "points";
  public amount!: number;
  public goldGrams!: number;
  public points!: number;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },
    schemeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "Schemes", key: "id" },
    },
    transactionType: {
      type: DataTypes.ENUM("deposit", "withdrawal", "points"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    goldGrams: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
  }
);

export default Transaction;
