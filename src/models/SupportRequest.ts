import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

export enum SupportRequestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

class SupportRequest extends Model {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public image_file_ids!: string[];
  public status!: SupportRequestStatus;
  public admin_remarks!: string | null;
  public updatedBy!: string | null;
  public is_deleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
}

SupportRequest.init(
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_file_ids: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SupportRequestStatus)),
      allowNull: false,
      defaultValue: SupportRequestStatus.PENDING,
    },
    admin_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "SupportRequest",
    tableName: "SupportRequests",
    indexes: [
      {
        fields: ["userId"],
        name: "support_request_user_idx",
      },
      {
        fields: ["status"],
        name: "support_request_status_idx",
      },
      {
        fields: ["is_deleted", "createdAt"],
        name: "support_request_deleted_created_idx",
      },
    ],
  }
);

export default SupportRequest;
