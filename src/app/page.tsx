import { db } from "@/lib/db";
import { AppShell } from "@/components/nx/app-shell";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  // default demo user = Arjun Deshmukh
  const user = await db.user.findFirst({ where: { email: "arjun@nx.in" } });

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="text-center">
          <p className="font-semibold">Initializing NeighborX…</p>
          <p className="text-sm text-muted-foreground">Please run the seed script.</p>
        </div>
      </div>
    );
  }

  // serialize dates to strings for client
  const safeUser = JSON.parse(JSON.stringify(user)) as User;

  return <AppShell user={safeUser} />;
}
