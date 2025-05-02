import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

export type NotificationType = "BONUS" | "INFO";

class Notification extends Model {
  public id!: string;
  public userId!: string | null;
  public type!: NotificationType;
  public title!: string;
  public message!: string;
  public image!: string | null;
  public data!: object | null;
  public is_viewed!: boolean;
  public viewed_at!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("BONUS", "INFO"),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    is_viewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: "Notification",
    indexes: [
      {
        fields: ["userId"],
        name: "notification_user_idx",
      },
      {
        fields: ["type"],
        name: "notification_type_idx",
      },
      {
        fields: ["is_viewed"],
        name: "notification_viewed_idx",
      },
    ],
  }
);

export default Notification; 