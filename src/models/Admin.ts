import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { AdminRole } from "../rbac/permissions";

class Admin extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: AdminRole;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Admin.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: AdminRole.ADMIN,
      validate: {
        isIn: [Object.values(AdminRole)],
      },
    },
  },
  {
    sequelize,
    modelName: "Admin",
  }
);

export default Admin;
