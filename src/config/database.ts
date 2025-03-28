import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  host: "localhost",  // Use local database
  port: 5432,         // PostgreSQL default port
  logging: false,     // Disable logging in production
});

export default sequelize;
