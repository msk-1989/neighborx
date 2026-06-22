import { PrismaClient } from "@prisma/client";
import { SCHEMA_SQL } from "@/lib/schema";
import { runSeed } from "../../prisma/seed";

/**
 * NeighborX database client — works in BOTH the local dev sandbox and on
 * Vercel serverless.
 *
 * Local dev:  DATABASE_URL points at a persistent SQLite file (db/custom.db).
 *             The DB is seeded via `bun prisma/seed.ts`; init here is a no-op.
 *
 * Vercel:     The serverless filesystem is READ-ONLY except /tmp. SQLite must
 *             live in /tmp and is re-created + seeded on every cold start.
 *             DATABASE_URL is set (via vercel.json env) to file:/tmp/neighborx.db.
 *             On the first query after a cold start, the $extends middleware
 *             below lazily applies SCHEMA_SQL and runs runSeed() so the app
 *             boots with full demo data. Writes persist only within the warm
 *             instance and reset on the next cold start — acceptable for a demo.
 */

// Fallback for serverless: if no DATABASE_URL is configured (e.g. Vercel didn't
// receive the env), default to /tmp so the app still boots instead of crashing.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:/tmp/neighborx.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  __nxInit?: Promise<void>;
};

/** Create a fresh, un-extended PrismaClient (used for bootstrapping). */
function createRawClient(): PrismaClient {
  return new PrismaClient({ log: ["error", "warn"] });
}

/**
 * Ensure the database has its schema + seed data. Idempotent and concurrency-
 * safe: the init promise is cached on globalThis, so parallel requests share
 * a single bootstrap. Runs at most once per cold start.
 *
 * Uses a SEPARATE raw client (not the extended `db` export) so the $extends
 * query middleware doesn't recurse into itself during bootstrap.
 */
function ensureInitialized(): Promise<void> {
  if (globalForPrisma.__nxInit) return globalForPrisma.__nxInit;

  globalForPrisma.__nxInit = (async () => {
    const client = createRawClient();
    try {
      // Probe: does the User table exist and is it queryable?
      try {
        await client.user.count();
      } catch {
        // Table missing → fresh /tmp DB. Apply the full schema DDL.
        // IMPORTANT: the prisma-migrate-diff output prefixes each statement
        // with `-- CreateTable` / `-- CreateIndex` comment lines. We must
        // strip comment lines BEFORE splitting on ";" — otherwise every
        // fragment starts with "--" and gets filtered out (zero statements).
        const cleaned = SCHEMA_SQL
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join("\n");
        const statements = cleaned
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        console.log(`[db] applying ${statements.length} schema statements…`);
        for (const stmt of statements) {
          try {
            await client.$executeRawUnsafe(stmt);
          } catch (err) {
            // Ignore "already exists" — schema apply is idempotent.
            console.warn("[db] schema stmt skipped:", (err as Error).message);
          }
        }
      }

      // Seed if the DB has no users yet (fresh cold start).
      const userCount = await client.user.count();
      if (userCount === 0) {
        console.log("[db] empty DB detected — running seed…");
        await runSeed(client);
        console.log("[db] seed complete.");
      }
    } finally {
      await client.$disconnect();
    }
  })();

  return globalForPrisma.__nxInit;
}

/**
 * The extended client every API route imports. Every query first awaits the
 * one-time bootstrap (schema + seed), then runs. On a warm instance this is a
 * resolved-promise no-op, so there's effectively zero per-query overhead.
 */
export const db = createRawClient().$extends({
  query: {
    $allOperations: async ({ args, query }) => {
      await ensureInitialized();
      return query(args);
    },
  },
});

// In development, reuse the client across hot reloads to avoid exhausting
// connections. (On Vercel each cold start is a fresh process, so this is moot.)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = globalForPrisma.prisma ?? createRawClient();
}
