import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Ensure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create stateless Neon HTTP client (NO keepalive)
const sql = neon(process.env.DATABASE_URL);

// Prevent multiple connections in Next.js dev mode
const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof drizzle>;
};

export const db =
  globalForDb.db ??
  drizzle(sql, {
    schema,
  });

if (!globalForDb.db) {
  globalForDb.db = db;
}
