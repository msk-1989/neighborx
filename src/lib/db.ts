import { PrismaClient } from "@prisma/client";

/**
 * NeighborX database client — Neon serverless PostgreSQL.
 *
 * - Persistent: data survives cold starts (unlike the previous /tmp SQLite
 *   bootstrap). The DB is seeded once via `bun prisma/seed.ts`.
 * - Connection: `DATABASE_URL` (env) points at Neon's pooled endpoint
 *   (PgBouncer transaction mode) for the app runtime. `DIRECT_DATABASE_URL`
 *   is used by the Prisma CLI for migrations / `db push`.
 * - Singleton: in dev, reuse the client across hot reloads to avoid leaking
 *   connections. On Vercel each cold start is a fresh process, so the global
 *   cache is naturally empty.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
