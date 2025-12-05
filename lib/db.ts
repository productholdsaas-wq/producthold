import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../configs/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// ⭐ REQUIRED FIX
neonConfig.fetchConnectionCache = true;

const client = neon(process.env.DATABASE_URL);

// Prevent multiple clients during hot reload
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof drizzle> };

export const db =
  globalForDb.db ?? drizzle(client, { schema });

if (!globalForDb.db) {
  globalForDb.db = db;
}
