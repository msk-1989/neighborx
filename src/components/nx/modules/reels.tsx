"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/types";
import type { Reel, ReelComment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreVertical,
  Plus,
  Send,
  Flag,
  Upload,
  Clapperboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Inline keyframe for the spinning music disc ──
// (Tailwind v4 doesn't ship a slow spin by default; use a 8s linear infinite.)
const SPIN_CLASS = "animate-[spin_8s_linear_infinite]";

/**
 * Hyperlocal Reel categories.
 *
 * NeighborX Reels are NOT global reels like Instagram — they are scoped to
 * your neighborhood. These categories reinforce the "neighborhood-first"
 * product principle: every category maps to a local-discovery use case
 * (showcase a local restaurant, walkthrough a property, clip a society
 * event, announce a lost-and-found, etc.).
 */
const REEL_CATEGORIES = [
  "COMMUNITY",     // 🎥 society updates, neighborhood life
  "BUSINESS",      // 🏢 local shop / business promotions
  "FOOD",          // 🍔 restaurant showcases, street food
  "PROPERTY",      // 🏠 property walkthroughs, rent/sell tours
  "JOBS",          // 💼 local job openings, hiring reels
  "EVENTS",        // 🎉 school functions, society events, festivals
  "ANNOUNCEMENTS", // 📢 lost & found, traffic, emergency alerts
] as const;

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Render caption text with hashtags highlighted in sky-300. */
function CaptionText({ text }: { text: string }) {
  const parts = text.split(/(\s+)/); // keep whitespace
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("#") && p.length > 1) {
          return (
            <span key={i} className="text-sky-300 font-medium">
              {p}
            </span>
          );
        }
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

export function Reels({ uid }: { uid: string }) {
  const [reels, setReels] = React.useState<Reel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [muted, setMuted] = React.useState(true);
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

  // sheet states
  const [commentsReelId, setCommentsReelId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const videoRefs = React.useRef<Map<string, HTMLVideoElement>>(new Map());
  const viewCountedRef = React.useRef<Set<string>>(new Set());
  const viewDebounceRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const qs = categoryFilter ? `&category=${categoryFilter}` : "";
      const data = await api<Reel[]>(`/api/reels?uid=${uid}${qs}`);
      setReels(data);
      setActiveIndex(0);
    } catch {
      setError(true);
      toast.error("Could not load reels");
    } finally {
      setLoading(false);
    }
  }, [uid, categoryFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  // ── Active-reel detection via IntersectionObserver ──
  React.useEffect(() => {
    if (loading || reels.length === 0) return;
    const root = scrollRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // pick the most-visible entry
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.isIntersecting && best.intersectionRatio >= 0.6) {
          const id = (best.target as HTMLElement).dataset.reelId;
          if (!id) return;
          const idx = reels.findIndex((r) => r.id === id);
          if (idx >= 0 && idx !== activeIndex) setActiveIndex(idx);
        }
      },
      { root, threshold: [0, 0.6, 0.9] },
    );

    const els = root.querySelectorAll<HTMLElement>("[data-reel-id]");
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [reels, activeIndex, loading]);

  // ── Play/pause + view count based on activeIndex ──
  React.useEffect(() => {
    if (loading || reels.length === 0) return;
    const activeReel = reels[activeIndex];
    if (!activeReel) return;

    // pause + reset all others; play active
    videoRefs.current.forEach((v, id) => {
      if (id === activeReel.id) {
        v.muted = muted;
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });

    // Debounced view increment (only once per active)
    const id = activeReel.id;
    if (!viewCountedRef.current.has(id)) {
      // clear any pending
      const prev = viewDebounceRef.current.get(id);
      if (prev) clearTimeout(prev);
      const t = setTimeout(async () => {
        // mark counted immediately to avoid duplicate scheduling
        viewCountedRef.current.add(id);
        viewDebounceRef.current.delete(id);
        try {
          const res = await api<{ views: number }>(
            `/api/reels/${id}/view`,
            { method: "POST" },
          );
          setReels((arr) =>
            arr.map((r) => (r.id === id ? { ...r, views: res.views } : r)),
          );
        } catch {
          // silent
        }
      }, 900);
      viewDebounceRef.current.set(id, t);
    }

    return () => {
      const t = viewDebounceRef.current.get(id);
      if (t) {
        clearTimeout(t);
        viewDebounceRef.current.delete(id);
      }
    };
  }, [activeIndex, reels, loading, muted]);

  // ── Mute propagation ──
  React.useEffect(() => {
    videoRefs.current.forEach((v) => {
      v.muted = muted;
    });
  }, [muted]);

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      viewDebounceRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // ── Like ──
  async function toggleLike(reel: Reel) {
    // optimistic
    const wasLiked = !!reel.isLiked;
    setReels((arr) =>
      arr.map((r) =>
        r.id === reel.id
          ? {
              ...r,
              isLiked: !wasLiked,
              likes: r.likes + (wasLiked ? -1 : 1),
            }
          : r,
      ),
    );
    try {
      const res = await api<{ liked: boolean; likes: number }>(
        `/api/reels/${reel.id}/like?uid=${uid}`,
        { method: "POST" },
      );
      setReels((arr) =>
        arr.map((r) =>
          r.id === reel.id
            ? { ...r, isLiked: res.liked, likes: res.likes }
            : r,
        ),
      );
    } catch {
      // revert on failure
      setReels((arr) =>
        arr.map((r) =>
          r.id === reel.id
            ? { ...r, isLiked: wasLiked, likes: r.likes }
            : r,
        ),
      );
      toast.error("Could not like reel");
    }
  }

  // ── Save (local only) ──
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  function toggleSave(reel: Reel) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reel.id)) {
        next.delete(reel.id);
        toast.success("Removed from saved");
      } else {
        next.add(reel.id);
        toast.success("Saved 🔖");
      }
      return next;
    });
  }

  // ── Follow (local only) ──
  const [followingIds, setFollowingIds] = React.useState<Set<string>>(new Set());
  function toggleFollow(reel: Reel) {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(reel.authorId)) {
        next.delete(reel.authorId);
        toast.success(`Unfollowed ${reel.author.name}`);
      } else {
        next.add(reel.authorId);
        toast.success(`Following ${reel.author.name} ✓`);
      }
      return next;
    });
  }

  // ── Share ──
  async function shareReel(reel: Reel) {
    const url = `${window.location.origin}/?reel=${reel.id}`;
    const shareData = {
      title: `${reel.author.name}'s reel on NeighborX`,
      text: reel.caption || "Check out this neighborhood reel!",
      url,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed; fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Reel link copied to clipboard 🔗");
    } catch {
      toast.error("Could not copy link");
    }
  }

  // ── Toggle play/pause on active video ──
  function togglePlayPause(reelId: string) {
    const v = videoRefs.current.get(reelId);
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }

  // ── Keyboard: Space toggles active, Arrows navigate ──
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (createOpen || commentsReelId) return;
      // Ignore when user is typing in inputs
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        const r = reels[activeIndex];
        if (r) togglePlayPause(r.id);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, reels.length - 1);
        scrollToIndex(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        scrollToIndex(prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reels, activeIndex, createOpen, commentsReelId]);

  function scrollToIndex(i: number) {
    const root = scrollRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-reel-id="${reels[i]?.id}"]`,
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Create reel submit ──
  async function submitReel(input: {
    videoUrl: string;
    caption: string;
    music: string;
    hashtags: string;
    category: string;
    thumbnailUrl: string;
  }) {
    try {
      const r = await api<Reel>(`/api/reels?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({
          videoUrl: input.videoUrl,
          caption: input.caption,
          music: input.music || undefined,
          hashtags: input.hashtags || undefined,
          thumbnailUrl: input.thumbnailUrl || undefined,
          category: input.category || undefined,
        }),
      });
      setReels((arr) => [r, ...arr]);
      setCreateOpen(false);
      // jump to the new reel
      setTimeout(() => scrollToIndex(0), 50);
      toast.success("Reel posted 🎬");
    } catch {
      toast.error("Failed to post reel");
    }
  }

  const commentsReel = reels.find((r) => r.id === commentsReelId) || null;

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <style>{`
        .nx-reels-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .nx-reels-scroll::-webkit-scrollbar { display: none; }
        .nx-scrollbar-thin { scrollbar-width: thin; }
        .nx-scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .nx-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 9999px; }
        .nx-scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/85 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2.5">
          <h1 className="text-lg font-bold">Reels</h1>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
        {/* Hyperlocal category filter chips */}
        <div className="nx-scrollbar-thin flex gap-1.5 overflow-x-auto px-4 pb-2">
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              categoryFilter === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            All
          </button>
          {REEL_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                categoryFilter === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll container — fills viewport height minus header */}
      <div
        ref={scrollRef}
        className={cn(
          "nx-reels-scroll relative h-[calc(100dvh-3.5rem-3rem)] snap-y snap-mandatory overflow-y-scroll rounded-none border-x bg-black lg:h-[calc(100dvh-4rem-3.5rem)]",
        )}
        aria-label="Reels feed"
      >
        {loading ? (
          <div className="h-full w-full">
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                className="h-full w-full snap-start bg-zinc-900"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-black p-6 text-center text-white">
            <p className="text-sm text-white/80">
              Could not load reels. Check your connection and try again.
            </p>
            <Button variant="secondary" onClick={load}>
              Retry
            </Button>
          </div>
        ) : reels.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          reels.map((reel, i) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              active={i === activeIndex}
              muted={muted}
              registerVideo={(el) => {
                if (el) videoRefs.current.set(reel.id, el);
                else videoRefs.current.delete(reel.id);
              }}
              onTogglePlay={() => togglePlayPause(reel.id)}
              onLike={() => toggleLike(reel)}
              onSave={() => toggleSave(reel)}
              saved={savedIds.has(reel.id)}
              onShare={() => shareReel(reel)}
              onOpenComments={() => setCommentsReelId(reel.id)}
              onFollow={() => toggleFollow(reel)}
              following={followingIds.has(reel.authorId)}
            />
          ))
        )}

        {/* Mute toggle (global, top-right of scroll container) */}
        {!loading && reels.length > 0 && (
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute reels" : "Mute reels"}
            className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-transform active:scale-95"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Comments sheet */}
      <CommentsSheet
        reel={commentsReel}
        open={!!commentsReel}
        onOpenChange={(o) => !o && setCommentsReelId(null)}
        uid={uid}
        onPosted={(c) => {
          setReels((arr) =>
            arr.map((r) =>
              r.id === c.reelId
                ? { ...r, commentCount: (r.commentCount ?? 0) + 1 }
                : r,
            ),
          );
        }}
      />

      {/* Create sheet */}
      <CreateReelSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={submitReel}
      />
    </div>
  );
}

// ────────────────────────────────────────────────
// Empty state
// ────────────────────────────────────────────────
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-900 to-black p-8 text-center text-white">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-white/10">
        <Clapperboard className="h-9 w-9 text-white" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">No reels yet</p>
        <p className="text-sm text-white/70">
          Be the first to post a neighborhood reel!
        </p>
      </div>
      <Button onClick={onCreate} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Create Reel
      </Button>
    </div>
  );
}

// ────────────────────────────────────────────────
// Single reel card
// ────────────────────────────────────────────────
function ReelCard({
  reel,
  active,
  muted,
  registerVideo,
  onTogglePlay,
  onLike,
  onSave,
  saved,
  onShare,
  onOpenComments,
  onFollow,
  following,
}: {
  reel: Reel;
  active: boolean;
  muted: boolean;
  registerVideo: (el: HTMLVideoElement | null) => void;
  onTogglePlay: () => void;
  onLike: () => void;
  onSave: () => void;
  saved: boolean;
  onShare: () => void;
  onOpenComments: () => void;
  onFollow: () => void;
  following: boolean;
}) {
  const [showIndicator, setShowIndicator] = React.useState<null | "play" | "pause">(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const indicatorTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClickVideo() {
    onTogglePlay();
    const v = document.getElementById(`reel-video-${reel.id}`) as HTMLVideoElement | null;
    const isPaused = v ? v.paused : false;
    flashIndicator(isPaused ? "play" : "pause");
  }

  function flashIndicator(kind: "play" | "pause") {
    setShowIndicator(kind);
    if (indicatorTimeout.current) clearTimeout(indicatorTimeout.current);
    indicatorTimeout.current = setTimeout(() => setShowIndicator(null), 600);
  }

  React.useEffect(() => {
    return () => {
      if (indicatorTimeout.current) clearTimeout(indicatorTimeout.current);
    };
  }, []);

  const commentCount = reel.commentCount ?? 0;

  return (
    <section
      data-reel-id={reel.id}
      className="relative h-full w-full snap-start overflow-hidden bg-black"
      aria-label={`Reel by ${reel.author.name}`}
    >
      {/* Video */}
      <video
        id={`reel-video-${reel.id}`}
        ref={registerVideo}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl || undefined}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        playsInline
        muted={muted}
        preload="metadata"
        aria-label={reel.caption || `Reel by ${reel.author.name}`}
        onClick={handleClickVideo}
      />

      {/* Tap to toggle indicator */}
      {showIndicator && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-black/55 text-white backdrop-blur">
            {showIndicator === "play" ? (
              <Play className="h-7 w-7 fill-current" />
            ) : (
              <Pause className="h-7 w-7 fill-current" />
            )}
          </div>
        </div>
      )}

      {/* Gradient overlay (bottom) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top-right more menu */}
      <div className="absolute right-3 top-14 z-20 lg:top-16">
        <button
          type="button"
          aria-label="More options"
          onClick={() => {
            setMenuOpen((o) => !o);
            toast("Coming soon: report & share options");
          }}
          className="grid h-8 w-8 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition-transform active:scale-95"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Right action rail */}
      <div className="absolute right-2.5 bottom-24 z-20 flex flex-col items-center gap-4 sm:bottom-28">
        <ActionButton
          ariaLabel={reel.isLiked ? "Unlike reel" : "Like reel"}
          onClick={onLike}
          icon={
            <Heart
              className={cn(
                "h-7 w-7 transition-transform sm:h-8 sm:w-8",
                reel.isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white",
              )}
            />
          }
          label={formatCount(reel.likes)}
        />
        <ActionButton
          ariaLabel="View comments"
          onClick={onOpenComments}
          icon={<MessageCircle className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
          label={formatCount(commentCount)}
        />
        <ActionButton
          ariaLabel="Share reel"
          onClick={onShare}
          icon={<Share2 className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
          label="Share"
        />
        <ActionButton
          ariaLabel={saved ? "Remove from saved" : "Save reel"}
          onClick={onSave}
          icon={
            <Bookmark
              className={cn(
                "h-7 w-7 text-white transition-transform sm:h-8 sm:w-8",
                saved && "fill-white text-white",
              )}
            />
          }
          label="Save"
        />
        {reel.music ? (
          <div className="mt-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-white/40 bg-zinc-900 shadow-md sm:h-10 sm:w-10">
            <div className={cn("grid h-full w-full place-items-center", SPIN_CLASS)}>
              <Music2 className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom-left content overlay */}
      <div className="absolute bottom-20 left-3 right-20 z-20 space-y-1.5 pb-tab-bar sm:bottom-24 sm:right-24">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-white/60">
            <AvatarImage src={reel.author.avatar || undefined} alt={reel.author.name} />
            <AvatarFallback className="bg-white/20 text-xs font-bold text-white">
              {initialsOf(reel.author.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-bold text-white drop-shadow">
            {reel.author.name}
          </span>
          <button
            type="button"
            onClick={onFollow}
            aria-label={following ? "Unfollow" : "Follow"}
            className={cn(
              "tap-feedback rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
              following
                ? "border-white/40 bg-white/10 text-white/90"
                : "border-white/60 bg-transparent text-white hover:bg-white/15",
            )}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>

        {reel.caption && (
          <p className="line-clamp-2 text-[13px] leading-snug text-white drop-shadow">
            <CaptionText text={reel.caption} />
          </p>
        )}

        {reel.music && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/90 drop-shadow">
            <Music2 className="h-3 w-3 shrink-0" />
            <span className="truncate">Original audio · {reel.music}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] capitalize">
            {reel.category?.toLowerCase()}
          </Badge>
          <span className="text-[10px] text-white/70 drop-shadow">
            {formatCount(reel.views)} views · {timeAgo(reel.createdAt)}
          </span>
        </div>
      </div>

      {/* Active indicator (subtle pulsing ring on side) */}
      {active && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-0.5 bg-primary/70" />
      )}
    </section>
  );
}

function ActionButton({
  ariaLabel,
  onClick,
  icon,
  label,
}: {
  ariaLabel: string;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="tap-feedback flex flex-col items-center gap-0.5"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full transition-transform active:scale-90">
        {icon}
      </span>
      <span className="text-[10px] font-semibold text-white drop-shadow">
        {label}
      </span>
    </button>
  );
}

function formatCount(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

// ────────────────────────────────────────────────
// Comments sheet
// ────────────────────────────────────────────────
function CommentsSheet({
  reel,
  open,
  onOpenChange,
  uid,
  onPosted,
}: {
  reel: Reel | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  uid: string;
  onPosted: (c: ReelComment) => void;
}) {
  const [comments, setComments] = React.useState<ReelComment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [text, setText] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !reel) return;
    let cancelled = false;
    setLoading(true);
    api<ReelComment[]>(`/api/reels/${reel.id}/comments`)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load comments");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, reel]);

  async function post() {
    if (!reel || !text.trim()) return;
    const content = text.trim();
    setPosting(true);
    // optimistic placeholder
    const optimistic: ReelComment = {
      id: `tmp-${Date.now()}`,
      content,
      reelId: reel.id,
      authorId: uid,
      author: {
        id: uid,
        name: "You",
        email: "",
        role: "RESIDENT",
        verifyMobile: true,
        verifyEmail: true,
        verifyAadhaar: false,
        verifyAddress: false,
        verifyBusiness: false,
        rewardPoints: 0,
        tier: "BRONZE",
        heroLevel: 0,
        area: "",
        city: "",
        district: "",
        state: "",
        society: "",
      } as ReelComment["author"],
      createdAt: new Date().toISOString(),
    };
    setComments((c) => [optimistic, ...c]);
    setText("");
    try {
      const c = await api<ReelComment>(`/api/reels/${reel.id}/comments?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setComments((arr) =>
        arr.map((x) => (x.id === optimistic.id ? c : x)),
      );
      onPosted(c);
    } catch {
      setComments((arr) => arr.filter((x) => x.id !== optimistic.id));
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto flex max-h-[85vh] max-w-[420px] flex-col rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-left text-base">
            Comments{reel ? ` · ${formatCount(reel.commentCount ?? 0)}` : ""}
          </SheetTitle>
        </SheetHeader>

        {/* list */}
        <div
          ref={scrollRef}
          className="nx-scrollbar-thin max-h-96 flex-1 overflow-y-auto px-4 py-3"
        >
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No comments yet. Start the conversation 💬
            </div>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={c.author.avatar || undefined} alt={c.author.name} />
                    <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                      {initialsOf(c.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{c.author.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 break-words text-sm leading-snug">{c.content}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Report comment"
                    className="grid h-6 w-6 shrink-0 place-items-center self-start rounded-full text-muted-foreground hover:bg-muted"
                    onClick={() => toast("Report feature coming soon")}
                  >
                    <Flag className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* footer composer */}
        <div className="flex items-end gap-2 border-t p-3 pb-safe">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[40px] flex-1 resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                post();
              }
            }}
          />
          <Button
            size="icon"
            onClick={post}
            disabled={!text.trim() || posting}
            aria-label="Send comment"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ────────────────────────────────────────────────
// Create reel sheet
// ────────────────────────────────────────────────
function CreateReelSheet({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (input: {
    videoUrl: string;
    caption: string;
    music: string;
    hashtags: string;
    category: string;
    thumbnailUrl: string;
  }) => Promise<void>;
}) {
  const [videoUrl, setVideoUrl] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [music, setMusic] = React.useState("");
  const [hashtags, setHashtags] = React.useState("");
  const [category, setCategory] = React.useState<string>("COMMUNITY");
  const [thumbnailUrl, setThumbnailUrl] = React.useState("");
  const [posting, setPosting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      // reset on close
      setVideoUrl("");
      setCaption("");
      setMusic("");
      setHashtags("");
      setCategory("COMMUNITY");
      setThumbnailUrl("");
    }
  }, [open]);

  async function submit() {
    if (!videoUrl.trim()) {
      toast.error("Please paste a video URL");
      return;
    }
    setPosting(true);
    try {
      await onSubmit({
        videoUrl: videoUrl.trim(),
        caption: caption.trim(),
        music: music.trim(),
        hashtags: hashtags.trim(),
        category,
        thumbnailUrl: thumbnailUrl.trim(),
      });
    } finally {
      setPosting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto flex max-h-[90vh] max-w-[420px] flex-col rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Clapperboard className="h-4 w-4" />
            Create a Reel
          </SheetTitle>
        </SheetHeader>

        <div className="nx-scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Video URL <span className="text-destructive">*</span></label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://...mp4"
              inputMode="url"
              autoCapitalize="off"
            />
            <p className="text-[11px] text-muted-foreground">
              Paste a direct video URL (.mp4, .webm). For demo, use Google sample videos.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... use #hashtags"
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Music (optional)</label>
              <Input
                value={music}
                onChange={(e) => setMusic(e.target.value)}
                placeholder="e.g. Lo-fi sunset"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {REEL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0) + c.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Hashtags (comma-separated)</label>
            <Input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#festival, #society, #food"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Thumbnail URL (optional)</label>
            <Input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://...jpg"
              inputMode="url"
              autoCapitalize="off"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
            <Upload className="h-3.5 w-3.5 shrink-0" />
            <span>
              Tip: For demo videos, try{" "}
              <code className="rounded bg-background px-1 py-0.5 text-[10px]">
                https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBigBuckBunny.mp4
              </code>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-3 pb-safe">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={posting || !videoUrl.trim()} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {posting ? "Posting..." : "Post Reel"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
