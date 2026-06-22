"use client";

import * as React from "react";
import { useNX } from "@/lib/store";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
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
import { ComingSoon } from "./modules/coming-soon";
import { AdminPanel } from "./modules/admin-panel";
import { IamProvider } from "@/lib/iam/use-iam";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

export function AppShell({ user }: { user: User }) {
  const active = useNX((s) => s.activeModule);
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
    <IamProvider initialRoles={["RESIDENT"]}>
    <div className="flex min-h-screen-dvh flex-col bg-background">
      <Header user={user} />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {/* desktop sidebar — definite height (viewport minus header) so the inner
            ScrollArea gets a bounded height and scrolls. sticky top-16 keeps it
            pinned while the flex row is in view; sticky clamping ensures the
            aside's bottom never passes its containing block's bottom (= footer
            top), so there is NO sidebar↔footer overlap. overflow-hidden clips
            the inner scroll; the ScrollArea inside handles scrolling. */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 self-start overflow-hidden border-r lg:block lg:top-16 lg:h-[calc(100dvh-4rem)]">
          <Sidebar uid={uid} />
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1">
          <div className={cn(
            "mx-auto px-3 py-4 pb-tab-bar sm:px-5 sm:py-5 lg:pb-8",
            active === "admin" ? "max-w-7xl" : "max-w-5xl",
          )}>
            {!isDashboard && !mod?.comingSoon && active !== "admin" && (
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
                {active === "property" && (
                  <ComingSoon
                    title="Property"
                    description="Hyperlocal real estate — buy, sell, rent, PG, hostel, and commercial property with verified listings and broker profiles."
                    phase={3}
                    icon={Icon!}
                    features={[
                      "Buy, sell, and rent residential & commercial property",
                      "Verified PG, hostel, and rental listings",
                      "Property reviews and virtual visit scheduling",
                      "Verified broker profiles with ratings",
                      "Property verification for trust & safety",
                    ]}
                  />
                )}
                {active === "society" && (
                  <ComingSoon
                    title="Society Management"
                    description="Digitize your residential society — visitor management, maintenance tracking, notices, facility booking, and polls."
                    phase={3}
                    icon={Icon!}
                    features={[
                      "Digital visitor management with gate pass",
                      "Maintenance dues tracking & online payment",
                      "Society notices & announcements board",
                      "Facility booking (clubhouse, gym, party hall)",
                      "Parking management & society polls",
                      "Complaint desk & staff management",
                    ]}
                  />
                )}

                {/* Phase 4 — Live + Coming Soon */}
                {active === "assistant" && <AIAssistant />}
                {active === "commerce" && (
                  <ComingSoon
                    title="Multinex Commerce"
                    description="Turn community into commerce — grocery, food, medicine, parcels, and rentals delivered hyperlocally."
                    phase={4}
                    icon={Icon!}
                    features={[
                      "Hyperlocal grocery & daily essentials delivery",
                      "Food ordering from neighborhood kitchens & restaurants",
                      "Medicine delivery from local pharmacies",
                      "Parcel pickup & drop within the neighborhood",
                      "Rental marketplace for equipment & appliances",
                    ]}
                  />
                )}
                {active === "fundraising" && (
                  <ComingSoon
                    title="Fundraising"
                    description="Community-powered fundraising for medical support, education, NGO campaigns, and local projects."
                    phase={4}
                    icon={Icon!}
                    features={[
                      "Medical fundraising for neighbors in need",
                      "Education support for deserving students",
                      "NGO & charity campaign hosting",
                      "Community project crowdfunding",
                      "Transparent fund tracking & updates",
                    ]}
                  />
                )}
                {active === "volunteer" && (
                  <ComingSoon
                    title="Volunteer Network"
                    description="A network of neighbors ready to help — blood donors, emergency volunteers, disaster response, and community service."
                    phase={4}
                    icon={Icon!}
                    features={[
                      "Blood donor registry with blood group & availability",
                      "Emergency volunteer responders",
                      "Disaster relief volunteer coordination",
                      "Community service & elderly assistance",
                      "Skill-based volunteering (teaching, medical, etc.)",
                    ]}
                  />
                )}
                {active === "carpool" && (
                  <ComingSoon
                    title="Carpool & Mobility"
                    description="Share rides with trusted neighbors — office carpool, school pickup, and shared transport."
                    phase={4}
                    icon={Icon!}
                    features={[
                      "Office carpool matching with verified colleagues",
                      "School pickup & drop coordination",
                      "Shared transport for events & outings",
                      "Verified drivers & riders only",
                      "Cost-splitting & route optimization",
                    ]}
                  />
                )}
                {active === "borrow" && (
                  <ComingSoon
                    title="Borrow & Lend"
                    description="Strengthen community trust — borrow and lend books, tools, wheelchairs, sports equipment, and more."
                    phase={4}
                    icon={Icon!}
                    features={[
                      "Share books, tools, and household equipment",
                      "Medical equipment lending (wheelchairs, crutches)",
                      "Sports & outdoor gear sharing",
                      "Trust-score based lending limits",
                      "Pickup/drop coordination via chat",
                    ]}
                  />
                )}
                {active === "skills" && (
                  <ComingSoon
                    title="Skill Exchange"
                    description="Learn and teach — language learning, tuition, computer training, music lessons, and more, neighbor-to-neighbor."
                    phase={4}
                    icon={Icon!}
                    features={[
                      "Language learning exchanges (English, regional, foreign)",
                      "Academic tuition for school & college students",
                      "Computer & digital skills training",
                      "Music, art, and hobby lessons",
                      "Skill-swapping — teach one, learn one free",
                    ]}
                  />
                )}

                {/* Admin Panel — Super Admin control center (RBAC-gated) */}
                {active === "admin" && <AdminPanel uid={uid} />}
              </div>
            </React.Suspense>
          </div>
        </main>
      </div>
      {/* Footer hidden on mobile (bottom tab bar replaces it). Visible on lg+. */}
      <div className="hidden lg:block">
        <Footer />
      </div>
      <MobileTabBar />
    </div>
    </IamProvider>
  );
}
