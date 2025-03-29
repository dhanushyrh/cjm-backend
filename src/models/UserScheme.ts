import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Scheme from "./Scheme";

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

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
  public readonly scheme?: Scheme;
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
    }
  },
  {
    sequelize,
    modelName: "UserScheme",
    indexes: [
      {
        unique: true,
        fields: ["userId", "schemeId", "status"],
        where: {
          status: "ACTIVE",
        },
        name: "unique_active_user_scheme",
      },
    ],
  }
);

export default UserScheme; 