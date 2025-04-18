import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import UserScheme from "./UserScheme";
import Admin from "./Admin";

export type RedemptionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RedemptionType = "BONUS" | "MATURITY";

class RedemptionRequest extends Model {
  public id!: string;
  public userSchemeId!: string;
  public type!: RedemptionType;
  public points?: number;
  public status!: RedemptionStatus;
  public approvedBy?: string;
  public approvedAt?: Date;
  public remarks?: string;
  public is_deleted!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly userScheme?: UserScheme;
  public readonly admin?: Admin;
}

RedemptionRequest.init(
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
    type: {
      type: DataTypes.ENUM("BONUS", "MATURITY"),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true, // Null for maturity redemption
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Admins",
        key: "id",
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  },
  {
    sequelize,
    modelName: "RedemptionRequest",
    indexes: [
      {
        fields: ["userSchemeId", "status"],
      },
      {
        fields: ["type", "status"],
      }
    ],
  }
);

export default RedemptionRequest; 