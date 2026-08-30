import readline from "readline";
import { hashPassword } from "../lib/auth";
import { db } from "../lib/db";
import { adminUsers, stationConfig } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("=== Radio 90 FM Bootstrap Admin Creator ===");
  const name = await ask("Enter Admin Name: ");
  const email = await ask("Enter Admin Email: ");
  const password = await ask("Enter Admin Password: ");

  if (!name || !email || !password) {
    console.error("All fields are required.");
    process.exit(1);
  }

  const hashedPassword = await hashPassword(password);
  const userId = crypto.randomUUID();

  try {
    // Check if user already exists
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()));

    if (existing.length > 0) {
      console.log(`Updating existing admin: ${email}`);
      await db
        .update(adminUsers)
        .set({
          name,
          passwordHash: hashedPassword,
          role: "ADMIN",
          updatedAt: new Date(),
        })
        .where(eq(adminUsers.email, email.toLowerCase()));
    } else {
      console.log(`Creating new admin user: ${email}`);
      await db.insert(adminUsers).values({
        id: userId,
        name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role: "ADMIN",
        active: true,
      });
    }

    // Ensure default station_config exists
    const existingConfig = await db.select().from(stationConfig);
    if (existingConfig.length === 0) {
      console.log("Initializing default station configuration...");
      await db.insert(stationConfig).values({
        id: 1,
        stationName: "Radio 90 FM",
        tagline: "Voice of Amal Jyothi",
        streamUrl: "https://icecast.octosignals.com/radio90_final",
        fallbackStreamUrl: "https://icecast.octosignals.com/radio90_final",
        streamEnabled: true,
        defaultPhone: "9496345029",
        defaultWhatsapp: "9048389090",
        email: "radio90@amaljyothi.ac.in",
        website: "https://radio90.in",
        timezone: "Asia/Kolkata",
        configVersion: 1,
      });
    }

    console.log("Successfully created/updated admin user and initialized station configuration!");
  } catch (err) {
    console.error("Error creating admin user:", err);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
