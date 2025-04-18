import { DataTypes } from "sequelize";
import sequelize from "../config/database";

async function addDescriptionColumn() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn("Transactions", "description", {
      type: DataTypes.STRING,
      allowNull: true
    });
    console.log("Successfully added description column to Transactions table");
  } catch (error) {
    console.error("Error adding description column:", error);
  } finally {
    await sequelize.close();
  }
}

addDescriptionColumn(); 