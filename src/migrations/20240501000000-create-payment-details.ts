import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  name: '20240501000000-create-payment-details',
  async up({ context: queryInterface }: { context: QueryInterface }) {
    await queryInterface.createTable("PaymentDetails", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_details: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      supporting_document_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
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
  },

  async down({ context: queryInterface }: { context: QueryInterface }) {
    await queryInterface.dropTable("PaymentDetails");
  }
}; 