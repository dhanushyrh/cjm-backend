import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Transactions", "redeemReqId", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "RedemptionRequests",
        key: "id"
      }
    });

    // Add an index for faster lookups
    await queryInterface.addIndex("Transactions", ["redeemReqId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Transactions", "redeemReqId");
  }
}; 