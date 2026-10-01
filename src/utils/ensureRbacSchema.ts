import sequelize from "../config/database";
import logger from "../config/logger";

/**
 * sequelize.sync() does not add columns to existing tables.
 * Ensure RBAC / audit columns exist (Postgres IF NOT EXISTS).
 */
export async function ensureRbacSchema(): Promise<void> {
  const statements = [
    `ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "role" VARCHAR(20) NOT NULL DEFAULT 'ADMIN'`,

    `ALTER TABLE "GoldPrices" ADD COLUMN IF NOT EXISTS "createdBy" UUID`,
    `ALTER TABLE "GoldPrices" ADD COLUMN IF NOT EXISTS "updatedBy" UUID`,

    `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "createdBy" UUID`,
    `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "updatedBy" UUID`,

    `ALTER TABLE "SchemeRequests" ADD COLUMN IF NOT EXISTS "updatedBy" UUID`,

    `ALTER TABLE "SupportRequests" ADD COLUMN IF NOT EXISTS "updatedBy" UUID`,

    `ALTER TABLE "circulars" ADD COLUMN IF NOT EXISTS "created_by" UUID`,
    `ALTER TABLE "circulars" ADD COLUMN IF NOT EXISTS "updated_by" UUID`,

    `ALTER TABLE "daily_tasks" ADD COLUMN IF NOT EXISTS "updated_by" UUID`,

    // Contact address may exceed VARCHAR(255)
    `ALTER TABLE "Settings" ALTER COLUMN "value" TYPE TEXT`,
  ];

  for (const sql of statements) {
    try {
      await sequelize.query(sql);
    } catch (error: any) {
      // Table may not exist yet on fresh installs; sync creates it afterward/before
      logger.warn(`ensureRbacSchema skipped: ${sql} — ${error?.message || error}`);
    }
  }
}
