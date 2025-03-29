import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  name: '20240330000000-add-description-to-transactions',
  async up({ context: queryInterface }: { context: QueryInterface }) {
    try {
      await queryInterface.addColumn("Transactions", "description", {
        type: DataTypes.STRING,
        allowNull: true
      });
    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down({ context: queryInterface }: { context: QueryInterface }) {
    try {
      await queryInterface.removeColumn("Transactions", "description");
    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  }
}; 