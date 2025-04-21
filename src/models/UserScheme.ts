import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Scheme from "./Scheme";
import PaymentDetails from "./PaymentDetails";

export type UserSchemeStatus = "ACTIVE" | "COMPLETED" | "WITHDRAWN";

class UserScheme extends Model {
  public id!: string;
  public userId!: string;
  public schemeId!: string;
  public startDate!: Date;
  public endDate!: Date;
  public totalPoints!: number;
  public availablePoints!: number;
  public status!: UserSchemeStatus;
  public desired_item?: string;
  public payment_details_id?: string;
  public certificate_delivered!: boolean;
  public accrued_gold!: number | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
  public readonly scheme?: Scheme;
  public readonly paymentDetails?: PaymentDetails;
}

UserScheme.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    schemeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Schemes",
        key: "id",
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    availablePoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "COMPLETED", "WITHDRAWN"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    desired_item: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payment_details_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "PaymentDetails",
        key: "id",
      },
    },
    certificate_delivered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    accrued_gold: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: null,
    }
  },
  {
    sequelize,
    modelName: "UserScheme",
    indexes: [
      // Non-unique index for better query performance
      {
        fields: ["userId", "schemeId", "status"],
        name: "user_scheme_status_idx",
      },
    ],
  }
);

export default UserScheme; 