import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

class SchemeRequest extends Model {
  public id!: string;
  public userId!: string;
  public desired_gold_grams!: number;
  public desired_item!: string;
  public convenient_time!: string;
  public is_addressed!: boolean;
  public comments!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
}

SchemeRequest.init(
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
    desired_gold_grams: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    desired_item: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    convenient_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_addressed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: "SchemeRequest",
    indexes: [
      {
        fields: ["userId"],
        name: "scheme_request_user_idx",
      },
      {
        fields: ["is_addressed"],
        name: "scheme_request_addressed_idx",
      },
    ],
  }
);

export default SchemeRequest; 