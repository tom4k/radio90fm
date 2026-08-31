import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgresql://user:password@localhost:5432/neondb";
const sql = neon(dbUrl);

export const db = drizzle(sql, { schema });

