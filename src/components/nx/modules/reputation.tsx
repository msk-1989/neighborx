"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type {
  User,
  Achievement,
  UserAchievement,
  ReputationTier,
} from "@/lib/types";
import {
  TIER_CONFIG,
  tierForPoints,
  nextTier,
  timeAgo,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  Trophy,
  Star,
  Crown,
  TrendingUp,
  Lock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar, VerifyBadges } from "../user-bits";

function tierBadge(tier: ReputationTier) {
  return TIER_CONFIG.find((t) => t.tier === tier);
}

interface ReputationData {
  user: User | null;
  allAchievements: Achievement[];
  userAchievements: UserAchievement[];
  leaderboard: User[];
}

const TIER_GLOW: Record<ReputationTier, string> = {
  BRONZE: "ring-amber-700/40 shadow-[0_0_20px_-4px_oklch(0.55_0.08_60)]",
  SILVER: "ring-slate-400/40 shadow-[0_0_20px_-4px_oklch(0.65_0.02_270)]",
  GOLD: "ring-amber-400/50 shadow-[0_0_22px_-4px_oklch(0.75_0.15_75)]",
  PLATINUM: "ring-cyan-400/50 shadow-[0_0_22px_-4px_oklch(0.7_0.1_200)]",
  LEGEND: "ring-fuchsia-500/50 shadow-[0_0_24px_-4px_oklch(0.65_0.2_330)]",
};

function rankEmoji(i: number): string {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return "";
}

export function Reputation({ uid }: { uid: string }) {
  const [data, setData] = React.useState<ReputationData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const d = await api<ReputationData>(`/api/reputation?uid=${uid}`);
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="h-40 animate-pulse bg-muted/40" />
        <Card className="h-40 animate-pulse bg-muted/40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        Couldn&apos;t load your reputation profile.
      </Card>
    );
  }

  const { user, allAchievements, userAchievements, leaderboard } = data;
  const earnedMap = new Map<string, UserAchievement>();
  userAchievements.forEach((ua) => earnedMap.set(ua.achievementId, ua));
  const earnedCount = userAchievements.length;

  const currentTier = tierForPoints(user.rewardPoints);
  const currentCfg = tierBadge(currentTier);
  const next = nextTier(user.rewardPoints);
  const progressPct = next
    ? Math.min(
        100,
        Math.round(
          ((user.rewardPoints - (currentCfg?.min ?? 0)) /
            (next.min - (currentCfg?.min ?? 0))) *
            100
        )
      )
    : 100;

  return (
    <div className="space-y-5">
      {/* Tier card */}
      <div className="brand-gradient relative overflow-hidden rounded-2xl p-5 text-white sm:p-6">
        <div className="absolute -right-8 -top-8 opacity-15">
          <Trophy className="h-32 w-32" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <UserAvatar
              user={user}
              size="h-14 w-14 ring-2 ring-white/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold leading-tight">{user.name}</h2>
              </div>
              <VerifyBadges user={user} size="xs" />
              <div className="mt-1.5 flex items-center gap-2">
                <Badge
                  className={cn(
                    "gap-1 border-0 text-xs",
                    currentCfg?.color || "bg-amber-700 text-amber-50"
                  )}
                >
                  <span>{currentCfg?.icon}</span>
                  {currentCfg?.label}
                </Badge>
                <span className="text-xs text-white/85">
                  {user.rewardPoints} pts
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 sm:ml-4">
            <div className="mb-1 flex items-center justify-between text-xs text-white/85">
              <span>
                {next
                  ? `Next: ${next.icon} ${next.label}`
                  : "Max tier reached 👑"}
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {next && (
              <p className="mt-1 text-[11px] text-white/80">
                {next.min - user.rewardPoints} pts to {next.label}
              </p>
            )}
          </div>
        </div>

        {/* Community Hero */}
        {user.heroLevel > 0 && (
          <div className="relative mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500/90 to-amber-400/90 px-3 py-2 text-sm font-semibold shadow-lg">
            <ShieldCheck className="h-4 w-4" />
            Community Hero · Level {user.heroLevel}
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
        )}
      </div>

      {/* Achievements */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <Trophy className="h-4 w-4 text-primary" /> Achievements
          </h3>
          <Badge variant="outline" className="gap-1">
            <Check className="h-3 w-3" /> {earnedCount} / {allAchievements.length} earned
          </Badge>
        </div>

        {allAchievements.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No achievements configured yet. Check back soon!
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {allAchievements.map((a) => {
              const earned = earnedMap.get(a.id);
              const earnedBool = !!earned;
              const aTier = (a.tier as ReputationTier) || "BRONZE";
              return (
                <Card
                  key={a.id}
                  className={cn(
                    "flex flex-col items-center p-4 text-center transition",
                    earnedBool
                      ? cn("ring-1", TIER_GLOW[aTier])
                      : "opacity-50 grayscale"
                  )}
                >
                  <div className="text-3xl">{a.icon}</div>
                  <div className="mt-2 line-clamp-1 text-sm font-semibold">
                    {a.title}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                    {a.description}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <TrendingUp className="h-3 w-3" /> +{a.points}
                    </Badge>
                    {earnedBool ? (
                      <Badge className="bg-primary/15 text-primary text-[10px] gap-1">
                        <Check className="h-3 w-3" /> Earned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Lock className="h-3 w-3" /> Locked
                      </Badge>
                    )}
                  </div>
                  {earnedBool && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {timeAgo(earned.earnedAt)}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Leaderboard */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-500" />
          <h3 className="text-base font-bold">Neighborhood Leaderboard</h3>
        </div>

        {leaderboard.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No rankings yet.
          </Card>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((u, i) => {
              const isMe = u.id === uid;
              const uTier = tierForPoints(u.rewardPoints);
              const uCfg = tierBadge(uTier);
              const loc = [u.society, u.area].filter(Boolean).join(", ");
              return (
                <Card
                  key={u.id}
                  className={cn(
                    "flex items-center gap-3 p-3",
                    isMe && "bg-primary/10 ring-1 ring-primary"
                  )}
                >
                  <div className="grid w-8 shrink-0 place-items-center text-base font-bold">
                    {rankEmoji(i) || (
                      <span className="text-sm text-muted-foreground">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <UserAvatar user={u} size="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold">
                        {u.name}
                      </span>
                      {isMe && (
                        <Badge className="bg-primary/15 text-primary text-[10px]">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {loc || u.city || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 border-0 text-[10px]",
                        uCfg?.color || "bg-amber-700 text-amber-50"
                      )}
                    >
                      <span>{uCfg?.icon}</span>
                      {uCfg?.label}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs font-bold text-primary">
                      <TrendingUp className="h-3 w-3" />
                      {u.rewardPoints}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          className="tap-feedback"
          onClick={() => {
            toast.info("Refreshing reputation…");
            load();
          }}
        >
          <Shield className="mr-1.5 h-3.5 w-3.5" /> Refresh
        </Button>
      </div>
    </div>
  );
}
