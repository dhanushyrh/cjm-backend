import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  name: '20240501000001-add-payment-details-id-to-user-scheme',
  async up({ context: queryInterface }: { context: QueryInterface }) {
    await queryInterface.addColumn("UserSchemes", "payment_details_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "PaymentDetails",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down({ context: queryInterface }: { context: QueryInterface }) {
    await queryInterface.removeColumn("UserSchemes", "payment_details_id");
  }
}; 