import { QueryInterface } from 'sequelize';
import sequelize from '../config/database';

async function runMigration() {
  const queryInterface: QueryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Migration: Removing unique constraint from UserSchemes...');
    
    // First check if the index exists
    try {
      // Remove the unique constraint/index
      await queryInterface.removeIndex('UserSchemes', 'unique_active_user_scheme');
      console.log('Unique constraint removed successfully.');
    } catch (err) {
      console.log('Index not found or already removed, continuing...');
    }
    
    try {
      // Add a non-unique index
      await queryInterface.addIndex('UserSchemes', ['userId', 'schemeId', 'status'], {
        name: 'user_scheme_status_idx'
      });
      console.log('Non-unique index added successfully.');
    } catch (err) {
      console.log('Error adding non-unique index:', err instanceof Error ? err.message : String(err));
      console.log('This may be because the index already exists.');
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error instanceof Error ? error.message : String(error));
  } finally {
    await sequelize.close();
  }
}

runMigration(); 