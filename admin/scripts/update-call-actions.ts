import "dotenv/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "admin/.env") });

import { db } from "../lib/db";
import { programs } from "../db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("=== Updating Call and WhatsApp Actions for Schedule ===");

  const allPrograms = await db.select().from(programs);
  console.log(`Found ${allPrograms.length} total programs in database.`);

  let updatedNonLive = 0;
  let updatedLive = 0;

  for (const prog of allPrograms) {
    const isLive = (prog.title || "").toLowerCase().includes("live");
    if (isLive) {
      await db
        .update(programs)
        .set({
          enableCall: true,
          enableWhatsapp: true,
          updatedAt: new Date(),
        })
        .where(sql`${programs.id} = ${prog.id}`);
      updatedLive++;
    } else {
      await db
        .update(programs)
        .set({
          enableCall: false,
          enableWhatsapp: false,
          updatedAt: new Date(),
        })
        .where(sql`${programs.id} = ${prog.id}`);
      updatedNonLive++;
    }
  }

  console.log(`Successfully updated database:`);
  console.log(`- ${updatedLive} Live programs kept with Calls & WhatsApp ENABLED.`);
  console.log(`- ${updatedNonLive} Non-live programs set with Calls & WhatsApp DISABLED.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error updating call actions:", err);
    process.exit(1);
  });
