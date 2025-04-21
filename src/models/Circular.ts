import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import CircularView from "./CircularView";

interface CircularAttributes {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  is_active: boolean;
  start_date: Date;
  end_date?: Date;
  priority: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CircularCreationAttributes extends Optional<CircularAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Circular extends Model<CircularAttributes, CircularCreationAttributes> {
  public id!: string;
  public title!: string;
  public description!: string;
  public image_url!: string | null;
  public link!: string | null;
  public is_active!: boolean;
  public start_date!: Date;
  public end_date!: Date | null;
  public priority!: number;
  public is_deleted!: boolean;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public readonly circularViews?: CircularView[];
}

Circular.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: "Circular",
    tableName: "circulars",
    underscored: true,
    indexes: [
      {
        name: "active_circulars_index",
        fields: ["is_active", "is_deleted"],
      },
    ],
  }
);

// Set up associations
Circular.hasMany(CircularView, {
  foreignKey: "circular_id",
  as: "circularViews",
});

export default Circular; 