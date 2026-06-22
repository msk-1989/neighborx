import { AppShell } from "@/components/nx/app-shell";
import { PublicSite } from "@/components/nx/public-site";
import { getSessionUser } from "@/lib/auth";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";
// Neon autosuspends after inactivity; the first query after a cold start can
// take a few seconds to wake the DB. 30s gives comfortable headroom on Vercel.
export const maxDuration = 30;

export default async function Page() {
  // Read session cookie → if no session, show the public marketing site
  // (landing page + auth flow). If session exists, show the full app.
  const user = await getSessionUser();

  if (!user) {
    return <PublicSite />;
  }

  // serialize dates to strings for client
  const safeUser = JSON.parse(JSON.stringify(user)) as User;

  return <AppShell user={safeUser} />;
}
