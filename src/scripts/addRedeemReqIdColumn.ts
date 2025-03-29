import sequelize from "../config/database";
import { DataTypes } from "sequelize";

async function addRedeemReqIdColumn() {
  try {
    await sequelize.getQueryInterface().addColumn("Transactions", "redeemReqId", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "RedemptionRequests",
        key: "id"
      }
    });

    await sequelize.getQueryInterface().addIndex("Transactions", ["redeemReqId"]);
    
    console.log("Successfully added redeemReqId column to Transactions table");
  } catch (error) {
    console.error("Error adding redeemReqId column:", error);
  }
}

addRedeemReqIdColumn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  }); 