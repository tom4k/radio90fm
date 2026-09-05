import { neon } from "@neondatabase/serverless";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "admin/.env") });

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://neondb_owner:npg_Gni5Bds2NxYg@ep-withered-wave-ausl7jb0-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const sql = neon(dbUrl);

async function main() {
  console.log("=== Migrating broadcast_notifications table columns ===");
  try {
    await sql`ALTER TABLE broadcast_notifications ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'standard';`;
    console.log("✓ Added 'type' column");

    await sql`ALTER TABLE broadcast_notifications ADD COLUMN IF NOT EXISTS action_url TEXT;`;
    console.log("✓ Added 'action_url' column");

    await sql`ALTER TABLE broadcast_notifications ADD COLUMN IF NOT EXISTS target_platform TEXT NOT NULL DEFAULT 'all';`;
    console.log("✓ Added 'target_platform' column");

    console.log("✅ Database migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    process.exit(0);
  }
}

main();
