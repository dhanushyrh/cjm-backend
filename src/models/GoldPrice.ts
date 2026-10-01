import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class GoldPrice extends Model {
  public id!: string;
  public date!: Date;
  public pricePerGram!: number;
  public is_deleted!: boolean;
  public createdBy!: string | null;
  public updatedBy!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    },
    pricePerGram: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "GoldPrice",
    indexes: [
      {
        unique: true,
        fields: ["date"],
        where: {
          is_deleted: false,
        },
        name: "unique_active_gold_price_per_date",
      },
    ],
  }
);

export default GoldPrice;
