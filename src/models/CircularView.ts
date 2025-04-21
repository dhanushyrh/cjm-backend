import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Circular from "./Circular";

class CircularView extends Model {
  public id!: number;
  public userId!: string;
  public circularId!: string;
  public viewedAt!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
  public readonly circular?: Circular;
}

CircularView.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
    circularId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "circulars",
        key: "id",
      },
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "CircularView",
    tableName: "circular_views",
    underscored: true,
    indexes: [
      {
        name: "circular_user_view_index",
        unique: true,
        fields: ["user_id", "circular_id"],
      },
    ],
  }
);

export default CircularView; 