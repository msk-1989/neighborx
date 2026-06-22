"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useNX } from "@/lib/store";
import type { Emergency, Listing, Job, Post, Business } from "@/lib/types";
import { MODULES } from "../modules-config";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/types";
import {
  Siren,
  ShoppingBag,
  Briefcase,
  Store,
  Newspaper,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Users,
  MapPin,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Dashboard({ uid }: { uid: string }) {
  const setModule = useNX((s) => s.setModule);
  const nb = useNX((s) => s.neighborhood);
  const [stats, setStats] = React.useState({ emergencies: 0, listings: 0, jobs: 0, businesses: 0, posts: 0 });
  const [recentEmergency, setRecentEmergency] = React.useState<Emergency | null>(null);
  const [trending, setTrending] = React.useState<Post[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const [em, li, jo, bi, po] = await Promise.all([
          api<Emergency[]>("/api/emergency"),
          api<Listing[]>("/api/marketplace"),
          api<Job[]>("/api/jobs"),
          api<Business[]>("/api/businesses"),
          api<Post[]>("/api/feed"),
        ]);
        setStats({
          emergencies: em.filter((e) => e.status === "ACTIVE").length,
          listings: li.length,
          jobs: jo.length,
          businesses: bi.length,
          posts: po.length,
        });
        setRecentEmergency(em.find((e) => e.status === "ACTIVE") || em[0] || null);
        setTrending(po.slice(0, 3));
      } catch {}
    })();
  }, []);

  const quickTiles = [
    { key: "feed" as const, label: "Community Feed", icon: Newspaper, stat: stats.posts, color: "text-chart-1" },
    { key: "marketplace" as const, label: "Marketplace", icon: ShoppingBag, stat: stats.listings, color: "text-chart-2" },
    { key: "jobs" as const, label: "Local Jobs", icon: Briefcase, stat: stats.jobs, color: "text-chart-4" },
    { key: "businesses" as const, label: "Businesses", icon: Store, stat: stats.businesses, color: "text-chart-3" },
  ];

  return (
    <div className="space-y-5">
      {/* hero */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="relative">
          <img src="/hero-neighborhood.png" alt="Indian neighborhood" className="h-56 w-full object-cover sm:h-64" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-xl px-5 sm:px-8">
              <Badge className="gap-1 bg-primary/15 text-primary border-primary/20 mb-2">
                <MapPin className="h-3 w-3" /> {nb.society}, {nb.city}
              </Badge>
              <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                Your Neighborhood. <br />
                Your Community. <span className="text-gradient">Your Marketplace.</span>
              </h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                India&apos;s hyperlocal super app — verified neighbors, local commerce, jobs, services, and a civic safety network, all in one trusted place.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5" onClick={() => setModule("feed")}>
                  <Newspaper className="h-4 w-4" /> Open Feed
                </Button>
                <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setModule("assistant")}>
                  <Sparkles className="h-4 w-4" /> Ask AI Assistant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* emergency ticker */}
      {recentEmergency && (
        <Card
          className={cn(
            "cursor-pointer p-3 transition-colors hover:bg-accent/40",
            recentEmergency.status === "ACTIVE" && "border-destructive/40"
          )}
          onClick={() => setModule("emergency")}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
              <Siren className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-destructive">Live SOS</span>
                <span className="text-xs text-muted-foreground">· {timeAgo(recentEmergency.createdAt)}</span>
              </div>
              <div className="truncate text-sm font-medium">{recentEmergency.title}</div>
              <div className="truncate text-xs text-muted-foreground">{recentEmergency.location}</div>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-1">View <ArrowRight className="h-3.5 w-3.5" /></Button>
          </div>
        </Card>
      )}

      {/* quick stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickTiles.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setModule(t.key)} className="text-left">
              <Card className="p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <Icon className={cn("h-5 w-5", t.color)} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-extrabold">{t.stat}</div>
                <div className="text-xs text-muted-foreground">{t.label}</div>
              </Card>
            </button>
          );
        })}
      </div>

      {/* two-column: trending + explore modules */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* trending posts */}
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-semibold">Trending in {nb.area}</span>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setModule("feed")}>
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-3">
            {trending.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading posts...</div>
            )}
            {trending.map((p) => (
              <button
                key={p.id}
                onClick={() => setModule("feed")}
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/40"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {p.author.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{p.author.name}</span>
                    <span>· {p.author.society}</span>
                    <span>· {timeAgo(p.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm">{p.content}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>❤️ {p.likes}</span>
                    <span>💬 {p.comments.length}</span>
                    {p.tag && <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{p.tag}</Badge>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* explore modules */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold">Explore</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MODULES.filter((m) => m.key !== "dashboard").map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setModule(m.key)}
                  className="flex flex-col items-start gap-1.5 rounded-lg border p-2.5 text-left transition-all hover:border-primary/40 hover:bg-accent/30"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* trust strip */}
      <Card className="p-4 brand-gradient-soft">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">A verified, trusted neighborhood network</div>
            <div className="text-sm text-muted-foreground">
              5-level verification (Mobile, Email, Aadhaar, Address, Business) keeps NeighborX safe for everyone.
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setModule("profile")}>
            <Users className="h-4 w-4" /> My Trust Score
          </Button>
        </div>
      </Card>
    </div>
  );
}
