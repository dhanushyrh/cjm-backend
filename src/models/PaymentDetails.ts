import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class PaymentDetails extends Model {
  public id!: string;
  public payment_mode!: string;
  public payment_details!: string;
  public supporting_document_url?: string;
  public amount!: number;
  public payment_date!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentDetails.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    payment_mode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    payment_details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    supporting_document_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "PaymentDetails",
    tableName: "PaymentDetails"
  }
);

export default PaymentDetails; 