import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Settings extends Model {
  public id!: string;
  public key!: string;
  public value!: string;
  public is_deleted!: boolean;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Settings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  },
  {
    sequelize,
    modelName: "Settings",
  }
);

export default Settings; 