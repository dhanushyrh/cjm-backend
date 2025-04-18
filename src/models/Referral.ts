import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

export enum ReferralStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  ON_HOLD = "ON_HOLD"
}

class Referral extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public age!: number;
  public email!: string;
  public phone!: string;
  public convenientDateTime!: Date;
  public comments!: string;
  public isAddressed!: boolean;
  public status!: ReferralStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Referral.init(
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
        key: "id"
      },
      field: "user_id"
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    convenientDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "convenient_datetime",
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isAddressed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_addressed",
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReferralStatus)),
      defaultValue: ReferralStatus.PENDING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Referral",
    tableName: "referrals",
    timestamps: true,
    underscored: true,
  }
);

export default Referral; 