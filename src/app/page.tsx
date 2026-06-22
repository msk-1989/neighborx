import { db } from "@/lib/db";
import { AppShell } from "@/components/nx/app-shell";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";
// Neon autosuspends after inactivity; the first query after a cold start can
// take a few seconds to wake the DB. 30s gives comfortable headroom on Vercel.
export const maxDuration = 30;

export default async function Page() {
  // default demo user = Arjun Deshmukh
  const user = await db.user.findFirst({ where: { email: "arjun@nx.in" } });

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="text-center">
          <p className="font-semibold">NeighborX is not seeded yet</p>
          <p className="text-sm text-muted-foreground">
            Run <code className="rounded bg-muted px-1.5 py-0.5">bun prisma/seed.ts</code> to populate the database.
          </p>
        </div>
      </div>
    );
  }

  // serialize dates to strings for client
  const safeUser = JSON.parse(JSON.stringify(user)) as User;

  return <AppShell user={safeUser} />;
}
