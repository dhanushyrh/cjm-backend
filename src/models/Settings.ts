import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Settings extends Model {
  public id!: string;
  public key!: string;
  public value!: string | number | boolean;
  public description?: string;
  public isSystem!: boolean;
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
      get() {
        const rawValue = this.getDataValue('value');
        try {
          return JSON.parse(rawValue);
        } catch {
          return rawValue;
        }
      },
      set(value: any) {
        this.setDataValue('value', JSON.stringify(value));
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isSystem: {
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