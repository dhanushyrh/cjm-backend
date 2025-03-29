import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  name: '20240321000001-update-settings-to-key-value',
  async up({ context: queryInterface }: { context: QueryInterface }) {
    // Drop the existing columns
    await queryInterface.removeColumn("Settings", "defaultBonusPoints");
    await queryInterface.removeColumn("Settings", "bonusModValue");

    // Add new columns
    await queryInterface.addColumn("Settings", "key", {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.addColumn("Settings", "value", {
      type: DataTypes.STRING,
      allowNull: false,
    });

    // Insert default settings
    await queryInterface.bulkInsert("Settings", [
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        key: "defaultBonusPoints",
        value: "5",
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0852",
        key: "bonusModValue",
        value: "10",
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down({ context: queryInterface }: { context: QueryInterface }) {
    // Remove new columns
    await queryInterface.removeColumn("Settings", "key");
    await queryInterface.removeColumn("Settings", "value");

    // Add back the old columns
    await queryInterface.addColumn("Settings", "defaultBonusPoints", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    });

    await queryInterface.addColumn("Settings", "bonusModValue", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    });
  }
}; 