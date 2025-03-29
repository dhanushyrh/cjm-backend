import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    // Insert minimum redemption points setting
    await queryInterface.bulkInsert("Settings", [
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0853",
        key: "minimumRedemptionPoints",
        value: "100", // Default 100 points minimum for redemption
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("Settings", {
      key: "minimumRedemptionPoints"
    });
  }
}; 