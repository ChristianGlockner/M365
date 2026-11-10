import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Lazy DB client. Requires DATABASE_URL.
 * Callers must filter by organizationId / tenantLinkId for isolation.
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and start Postgres via docker compose.",
    );
  }
  if (!client) {
    client = postgres(url, { max: 10 });
    db = drizzle(client, { schema });
  }
  return db!;
}

export type PlatformDb = ReturnType<typeof getDb>;
