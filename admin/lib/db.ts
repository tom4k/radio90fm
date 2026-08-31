import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const rawUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/neondb";
const cleanUrl = rawUrl.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?");

const sql = neon(cleanUrl);

export const db = drizzle(sql, { schema });

