import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import UserScheme from "./UserScheme";
import Referral from "./Referral";

class User extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public current_address!: string;
  public permanent_address!: string;
  public email!: string;
  public password!: string;
  public nominee!: string;
  public relation!: string;
  public mobile!: string;
  public dob!: Date;
  public agreeTerms!: boolean;
  public is_active!: boolean;
  public receive_posts!: boolean;
  public profile_image?: string;
  public id_proof?: string;
  public referred_by?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly schemes?: UserScheme[];
  public readonly referrer?: User;
  public readonly referrals?: User[];
  public readonly userReferrals?: Referral[];
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    current_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    permanent_address: {
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
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    receive_posts: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_proof: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referred_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      }
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
  }
);

// Add self-referential associations after model initialization
User.belongsTo(User, { as: "referrer", foreignKey: "referred_by" });
User.hasMany(User, { as: "referrals", foreignKey: "referred_by" });

export default User;
