import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import UserScheme from "./UserScheme";

class User extends Model {
  public id!: string;
  public name!: string;
  public address!: string;
  public email!: string;
  public password!: string;
  public nominee!: string;
  public relation!: string;
  public mobile!: string;
  public dob!: Date;
  public agreeTerms!: boolean;
  public schemeId?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly schemes?: UserScheme[];
}

User.init(
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
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nominee: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    relation: {
      type: DataTypes.STRING,
      allowNull: false,
      values: ["Father", "Mother", "Son", "Daughter", "Husband", "Spouse", "Other"],
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    agreeTerms: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    schemeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "Schemes", key: "id" },
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

export default User;
