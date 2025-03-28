import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Scheme extends Model {
  public id!: string;
  public name!: string;
  public duration!: number; // months
  public goldGrams!: number; // total grams
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
    },
    duration: {
      type: DataTypes.INTEGER, // in months
      allowNull: false,
    },
    goldGrams: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Scheme",
  }
);

export default Scheme;
