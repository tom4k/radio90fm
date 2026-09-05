import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { neon } from "@neondatabase/serverless";

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found in environment");
    process.exit(1);
  }

  const sql = neon(connectionString);
  console.log("Migrating station_config table for settings_enabled column...");

  try {
    await sql`
      ALTER TABLE station_config
      ADD COLUMN IF NOT EXISTS settings_enabled BOOLEAN DEFAULT true NOT NULL;
    `;
    console.log("✅ Successfully added settings_enabled column to station_config!");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

run();
