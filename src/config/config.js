require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "dhanush123",
    database: process.env.DB_NAME || "cjm_db",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "dhanush123",
    database: process.env.DB_NAME || "cjm_db_test",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false
  }
}; 