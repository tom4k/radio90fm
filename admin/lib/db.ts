import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "admin/.env") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://neondb_owner:npg_Gni5Bds2NxYg@ep-withered-wave-ausl7jb0-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const sql = neon(dbUrl);

export const db = drizzle(sql, { schema });

