import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type DailyTaskSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface DailyTaskSubmissionAttributes {
  id: string;
  task_id: string;
  user_id: string;
  image_file_id: string;
  message: string | null;
  status: DailyTaskSubmissionStatus;
  admin_remarks: string | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;
  points_awarded: number | null;
  user_scheme_id: string | null;
  created_at: Date;
  updated_at: Date;
}

interface DailyTaskSubmissionCreationAttributes
  extends Optional<
    DailyTaskSubmissionAttributes,
    | "id"
    | "message"
    | "status"
    | "admin_remarks"
    | "reviewed_by"
    | "reviewed_at"
    | "points_awarded"
    | "user_scheme_id"
    | "created_at"
    | "updated_at"
  > {}

export class DailyTaskSubmission extends Model<
  DailyTaskSubmissionAttributes,
  DailyTaskSubmissionCreationAttributes
> {
  public id!: string;
  public task_id!: string;
  public user_id!: string;
  public image_file_id!: string;
  public message!: string | null;
  public status!: DailyTaskSubmissionStatus;
  public admin_remarks!: string | null;
  public reviewed_by!: string | null;
  public reviewed_at!: Date | null;
  public points_awarded!: number | null;
  public user_scheme_id!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

DailyTaskSubmission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    image_file_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    admin_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    points_awarded: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_scheme_id: {
      type: DataTypes.UUID,
      allowNull: true,
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
    modelName: "DailyTaskSubmission",
    tableName: "daily_task_submissions",
    underscored: true,
    indexes: [
      {
        name: "idx_daily_task_submissions_user",
        fields: ["user_id", "status"],
      },
      {
        name: "idx_daily_task_submissions_task",
        fields: ["task_id", "status"],
      },
    ],
  }
);

export default DailyTaskSubmission;
