import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import UserScheme from "./UserScheme";

class Scheme extends Model {
  public id!: string;
  public name!: string;
  public duration!: number; // months
  public goldGrams!: number; // total grams

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly users?: UserScheme[];
}

Scheme.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    duration: {
      type: DataTypes.INTEGER, // in months
      allowNull: false,
    },
    goldGrams: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Scheme",
  }
);

export default Scheme;
