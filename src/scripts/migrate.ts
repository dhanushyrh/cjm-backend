import { Umzug, SequelizeStorage } from "umzug";
import sequelize from "../config/database";
import path from "path";

const migrator = new Umzug({
  migrations: {
    glob: ["../migrations/*.ts", { cwd: __dirname }],
    resolve: ({ name, path, context }) => {
      const migration = require(path!);
      return {
        name,
        up: async () => migration.up(context, sequelize),
        down: async () => migration.down(context, sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const seeder = new Umzug({
  migrations: {
    glob: ["../seeders/*.ts", { cwd: __dirname }],
    resolve: ({ name, path, context }) => {
      const seeder = require(path!);
      return {
        name,
        up: async () => seeder.up(context, sequelize),
        down: async () => seeder.down(context, sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: "SequelizeSeeds" }),
  logger: console,
});

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Run migrations
    console.log("Running migrations...");
    await migrator.up();
    console.log("Migrations completed successfully.");

    // Run seeders
    console.log("Running seeders...");
    await seeder.up();
    console.log("Seeders completed successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations(); 