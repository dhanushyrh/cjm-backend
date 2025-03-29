import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  name: '20240321000000-create-settings',
  async up({ context: queryInterface }: { context: QueryInterface }) {
    await queryInterface.createTable("Settings", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      defaultBonusPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      bonusModValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
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
  },

  async down({ context: queryInterface }: { context: QueryInterface }) {
    await queryInterface.dropTable("Settings");
  }
}; 