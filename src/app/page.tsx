import { db } from "@/lib/db";
import { AppShell } from "@/components/nx/app-shell";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";
// The first request after a Vercel cold start bootstraps the /tmp SQLite DB
// (apply schema + run seed). Give the serverless function enough headroom.
export const maxDuration = 60;

export default async function Page() {
  // default demo user = Arjun Deshmukh
  try {
    const user = await db.user.findFirst({ where: { email: "arjun@nx.in" } });

    if (!user) {
      return (
        <div className="grid min-h-screen place-items-center p-6">
          <div className="text-center">
            <p className="font-semibold">Initializing NeighborX…</p>
            <p className="text-sm text-muted-foreground">
              The neighborhood database is being seeded. Please refresh in a
              moment.
            </p>
          </div>
        </div>
      );
    }

    // serialize dates to strings for client
    const safeUser = JSON.parse(JSON.stringify(user)) as User;

    return <AppShell user={safeUser} />;
  } catch (e) {
    console.error("[page] DB error:", e);
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <p className="font-semibold">NeighborX is warming up…</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The database is initializing on the serverless runtime. Please
            refresh in a moment.
          </p>
        </div>
      </div>
    );
  }
}
