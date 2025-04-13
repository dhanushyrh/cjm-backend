import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

export type FilePurpose = "PROFILE_IMAGE" | "ID_PROOF" | "OTHER" | "SUPPORTING_DOC";

class File extends Model {
  public id!: string;
  public originalName!: string;
  public filename!: string;
  public mimeType!: string;
  public size!: number;
  public path!: string;
  public url!: string;
  public userId?: string;
  public purpose!: FilePurpose;
  public is_deleted!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
}

File.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    purpose: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "File",
    indexes: [
      {
        fields: ["userId", "purpose"],
        name: "idx_files_user_purpose",
      },
    ],
  }
);

// Add association with User model
File.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(File, { foreignKey: "userId", as: "files" });

export default File; 