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
  console.log("Cleaning program phone & whatsapp numbers in database...");

  try {
    await sql`
      UPDATE programs
      SET phone_number = NULL
      WHERE phone_number = '9496345029' OR phone_number = '';
    `;

    await sql`
      UPDATE programs
      SET whatsapp_number = NULL
      WHERE whatsapp_number = '9048389090' OR whatsapp_number = '';
    `;

    console.log("✅ Successfully updated programs table so live shows dynamically inherit station admin numbers!");
  } catch (err) {
    console.error("Database update error:", err);
  }
}

run();
