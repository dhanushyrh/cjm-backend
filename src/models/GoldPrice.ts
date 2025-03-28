import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class GoldPrice extends Model {
  public id!: string;
  public date!: Date;
  public pricePerGram!: number;
}

GoldPrice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true, // One price per day
    },
    pricePerGram: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "GoldPrice",
  }
);

export default GoldPrice;
