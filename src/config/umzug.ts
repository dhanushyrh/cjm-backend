import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from './database';

export const umzug = new Umzug({
  migrations: {
    glob: ['../migrations/*.ts', { cwd: __dirname }],
    resolve: ({ name, path: migrationPath, context }) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const migration = require(migrationPath as string);
      return {
        name,
        up: async () => migration.up({ context }),
        down: async () => migration.down({ context }),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
  create: {
    folder: 'src/migrations',
  },
}); 