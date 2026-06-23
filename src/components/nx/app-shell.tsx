"use client";

import * as React from "react";
import { useNX } from "@/lib/store";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MobileTabBar } from "./mobile-tab-bar";
import { MODULES } from "./modules-config";
import { Dashboard } from "./modules/dashboard";
import { HomeFeed } from "./modules/home-feed";
import { CommunityGroups } from "./modules/community-groups";
import { Marketplace } from "./modules/marketplace";
import { Businesses } from "./modules/businesses";
import { Services } from "./modules/services";
import { Jobs } from "./modules/jobs";
import { Emergency } from "./modules/emergency";
import { Complaints } from "./modules/complaints";
import { LostFound } from "./modules/lost-found";
import { Events } from "./modules/events";
import { AIAssistant } from "./modules/ai-assistant";
import { CommunityChat } from "./modules/community-chat";
import { Profile } from "./modules/profile";
import { Reputation } from "./modules/reputation";
import { NeighborhoodWatch } from "./modules/neighborhood-watch";
import { Borrow } from "./modules/borrow";
import { Skills } from "./modules/skills";
import { Carpool } from "./modules/carpool";
import { Volunteer } from "./modules/volunteer";
import { Fundraising } from "./modules/fundraising";
import { Property } from "./modules/property";
import { Society } from "./modules/society";
import { Commerce } from "./modules/commerce";
import { Reels } from "./modules/reels";
import { YellowPages } from "./modules/yellow-pages";
import { NeighborhoodSearch } from "./modules/search";
import { AdminShell } from "./admin-shell";
import { IamProvider, useIam } from "@/lib/iam/use-iam";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

export function AppShell({ user }: { user: User }) {
  const active = useNX((s) => s.activeModule);
  const adminView = useNX((s) => s.adminView);
  const uid = user.id;
  const mod = MODULES.find((m) => m.key === active);
  const Icon = mod?.icon;
  const isDashboard = active === "dashboard";

  // Manually rehydrate persisted user preferences AFTER hydration so the
  // client's first paint matches the server-rendered HTML exactly.
  React.useEffect(() => {
    void useNX.persist.rehydrate();
  }, []);

  return (
    <IamProvider uid={uid} initialRoles={["RESIDENT"]}>
    <AdminGate user={user} adminView={adminView}>
    {(showAdmin) => showAdmin ? (
      <AdminShell user={user} />
    ) : (
    <div className="flex min-h-screen-dvh flex-col bg-background">
      <Header user={user} />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {/* desktop sidebar — definite height (viewport minus header) so the inner
            ScrollArea gets a bounded height and scrolls. sticky top-16 keeps it
            pinned while the flex row is in view; sticky clamping ensures the
            aside's bottom never passes its containing block's bottom, so there
            is NO sidebar overlap with the page bottom. overflow-hidden clips
            the inner scroll; the ScrollArea inside handles scrolling. */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 self-start overflow-hidden border-r lg:block lg:top-16 lg:h-[calc(100dvh-4rem)]">
          <Sidebar uid={uid} />
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1">
          <div className={cn(
            "mx-auto px-3 py-4 pb-tab-bar sm:px-5 sm:py-5 lg:pb-8",
            "max-w-5xl",
          )}>
            {!isDashboard && !mod?.comingSoon && (
              <div className="mb-4 hidden items-center gap-3 sm:flex">
                {Icon && (
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold leading-tight">{mod?.label}</h1>
                  <p className="text-sm text-muted-foreground">{mod?.desc}</p>
                </div>
              </div>
            )}
            <React.Suspense
              fallback={<div className="h-40 animate-pulse rounded-lg bg-muted/40" />}
            >
              <div key={active} className="animate-fade-in-up">
                {/* Phase 1 — Live */}
                {active === "dashboard" && <Dashboard uid={uid} />}
                {active === "feed" && <HomeFeed uid={uid} />}
                {active === "groups" && <CommunityGroups uid={uid} />}
                {active === "events" && <Events uid={uid} />}
                {active === "chat" && <CommunityChat user={user} />}
                {active === "lostfound" && <LostFound uid={uid} />}
                {active === "watch" && <NeighborhoodWatch uid={uid} />}
                {active === "emergency" && <Emergency uid={uid} />}
                {active === "reputation" && <Reputation uid={uid} />}
                {active === "profile" && <Profile user={user} />}
                {active === "businesses" && <Businesses />}

                {/* Phase 2 — Live */}
                {active === "marketplace" && <Marketplace uid={uid} />}
                {active === "services" && <Services uid={uid} />}
                {active === "jobs" && <Jobs uid={uid} />}

                {/* Phase 3 — Live + Coming Soon */}
                {active === "complaints" && <Complaints uid={uid} />}
                {active === "property" && <Property uid={uid} />}
                {active === "society" && <Society uid={uid} />}

                {/* Phase 4 — Live + Coming Soon */}
                {active === "assistant" && <AIAssistant />}
                {active === "commerce" && <Commerce uid={uid} />}
                {active === "fundraising" && <Fundraising uid={uid} />}
                {active === "volunteer" && <Volunteer uid={uid} />}
                {active === "carpool" && <Carpool uid={uid} />}
                {active === "borrow" && <Borrow uid={uid} />}
                {active === "skills" && <Skills uid={uid} />}
                {active === "reels" && <Reels uid={uid} />}

                {/* Phase 5 — Discovery layer */}
                {active === "yellowpages" && <YellowPages uid={uid} />}
                {active === "search" && <NeighborhoodSearch uid={uid} />}
              </div>
            </React.Suspense>
          </div>
        </main>
      </div>
      {/* No footer in the app panel — it's a full-height app-like experience.
          The marketing footer lives only on the public landing page.
          Mobile users get the bottom tab bar instead. */}
      <MobileTabBar />
    </div>
    )}
    </AdminGate>
    </IamProvider>
  );
}

/**
 * Gate that decides whether to show the AdminShell or the user app.
 * If adminView is true AND the user is an admin, show AdminShell.
 * Otherwise show the user app.
 */
function AdminGate({ user, adminView, children }: {
  user: User;
  adminView: boolean;
  children: (showAdmin: boolean) => React.ReactNode;
}) {
  const iam = useIam();
  // Only show admin shell if: adminView toggle is on AND user is actually an admin
  // AND IAM has finished loading (so we don't flash the admin shell prematurely)
  const showAdmin = adminView && iam.isAdmin && !iam.loading;
  return <>{children(showAdmin)}</>;
}
