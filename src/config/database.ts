import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "cjm_db",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "dhanush123",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;

// Import models
import "../models/Admin";
import "../models/User";
import "../models/Scheme";
import "../models/UserScheme";
import "../models/Transaction";
import "../models/GoldPrice";
import "../models/Settings";

// Setup associations
import { setupAssociations } from "../models/associations";
setupAssociations();
