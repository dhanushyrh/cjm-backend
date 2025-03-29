import { umzug } from './config/umzug';

async function migrate() {
  try {
    await umzug.up();
    console.log('All migrations have been executed successfully.');
  } catch (error) {
    console.error('Error executing migrations:', error);
    process.exit(1);
  }
  process.exit(0);
}

migrate(); 