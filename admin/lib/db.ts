import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/neondb");

export const db = drizzle(sql, { schema });
