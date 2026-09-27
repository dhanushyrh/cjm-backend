import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface DailyTaskAttributes {
  id: string;
  title: string | null;
  message: string;
  task_date: string;
  expires_at: Date;
  is_active: boolean;
  created_by: string | null;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DailyTaskCreationAttributes
  extends Optional<
    DailyTaskAttributes,
    "id" | "title" | "created_by" | "is_active" | "is_deleted" | "created_at" | "updated_at"
  > {}

export class DailyTask extends Model<DailyTaskAttributes, DailyTaskCreationAttributes> {
  public id!: string;
  public title!: string | null;
  public message!: string;
  public task_date!: string;
  public expires_at!: Date;
  public is_active!: boolean;
  public created_by!: string | null;
  public is_deleted!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

DailyTask.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    task_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "DailyTask",
    tableName: "daily_tasks",
    underscored: true,
    indexes: [
      {
        name: "idx_daily_tasks_today",
        fields: ["task_date", "is_active", "is_deleted"],
      },
    ],
  }
);

export default DailyTask;
