"use client";

import * as React from "react";
import { useNX } from "@/lib/store";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import { MODULES } from "./modules-config";
import { Dashboard } from "./modules/dashboard";
import { HomeFeed } from "./modules/home-feed";
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
import type { User } from "@/lib/types";

export function AppShell({ user }: { user: User }) {
  const active = useNX((s) => s.activeModule);
  const uid = user.id;
  const mod = MODULES.find((m) => m.key === active);
  const Icon = mod?.icon;
  const isDashboard = active === "dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header user={user} />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {/* desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r lg:block">
          <Sidebar />
        </aside>

        {/* main */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-5xl px-3 py-5 sm:px-5">
            {!isDashboard && (
              <div className="mb-4 flex items-center gap-3">
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
            <React.Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted/40" />}>
              {active === "dashboard" && <Dashboard uid={uid} />}
              {active === "feed" && <HomeFeed uid={uid} />}
              {active === "marketplace" && <Marketplace uid={uid} />}
              {active === "businesses" && <Businesses />}
              {active === "services" && <Services uid={uid} />}
              {active === "jobs" && <Jobs uid={uid} />}
              {active === "emergency" && <Emergency uid={uid} />}
              {active === "complaints" && <Complaints uid={uid} />}
              {active === "lostfound" && <LostFound uid={uid} />}
              {active === "events" && <Events uid={uid} />}
              {active === "assistant" && <AIAssistant />}
              {active === "chat" && <CommunityChat user={user} />}
              {active === "profile" && <Profile user={user} />}
            </React.Suspense>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
