import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("RedemptionRequests", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userSchemeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "UserSchemes",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM("BONUS", "MATURITY"),
        allowNull: false,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Admins",
          key: "id",
        },
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    });

    // Add indexes
    await queryInterface.addIndex("RedemptionRequests", ["userSchemeId", "status"]);
    await queryInterface.addIndex("RedemptionRequests", ["type", "status"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("RedemptionRequests");
  }
}; 