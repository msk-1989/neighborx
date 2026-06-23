"use client";

// =====================================================================
// Neighborhood Search — unified discovery layer for NeighborX
// =====================================================================
// Searches across ALL existing neighborhood content (posts, businesses,
// reels, jobs, properties, services, yellow pages, marketplace) via the
// /api/search endpoint. This is a force-multiplier for discovery — it does
// NOT add a social feed, it makes existing content findable.
//
// UX:
//  - Auto-focused search bar at the top with hyperlocal placeholder.
//  - Row of type-filter chips with live counts (All / Posts / Businesses / …).
//  - Friendly empty state with clickable popular suggestions.
//  - Debounced 350ms + Enter-to-search.
//  - Flat results list (type badge on each card). Clicking a result toasts
//    "Opening <type>…" — app-shell module navigation is wired later.
// =====================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search as SearchIcon,
  Sparkles,
  X,
  Store,
  Newspaper,
  Clapperboard,
  Briefcase,
  Home,
  Wrench,
  BookOpen,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { SearchResult, SearchResponse } from "@/lib/types";

type ResultType = SearchResult["type"];

// --- type metadata ----------------------------------------------------

interface TypeMeta {
  label: string;          // chip label
  badgeClass: string;     // badge color
  icon: React.ComponentType<{ className?: string }>;
}

const TYPE_META: Record<ResultType, TypeMeta> = {
  post: {
    label: "Posts",
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    icon: Newspaper,
  },
  business: {
    label: "Businesses",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    icon: Store,
  },
  reel: {
    label: "Reels",
    badgeClass: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
    icon: Clapperboard,
  },
  job: {
    label: "Jobs",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    icon: Briefcase,
  },
  property: {
    label: "Properties",
    badgeClass: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    icon: Home,
  },
  service: {
    label: "Services",
    badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    icon: Wrench,
  },
  yellowpage: {
    label: "Yellow Pages",
    badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    icon: BookOpen,
  },
  marketplace: {
    label: "Marketplace",
    badgeClass: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    icon: ShoppingBag,
  },
};

// Order of chips in the filter row.
const TYPE_ORDER: ResultType[] = [
  "post",
  "business",
  "reel",
  "job",
  "property",
  "service",
  "yellowpage",
  "marketplace",
];

const POPULAR_SUGGESTIONS = [
  "biryani",
  "math tutor",
  "2 BHK rent",
  "blood donor",
  "electrician",
  "doctor",
];

const DEBOUNCE_MS = 350;

// =====================================================================
// Component
// =====================================================================

export function NeighborhoodSearch({ uid }: { uid: string }) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<ResultType | "all">("all");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  // Tracks whether any search has been executed — drives the empty state.
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // Auto-focus the search input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Core search function. Uses an incrementing request id so stale responses
  // (from earlier, slower queries) don't overwrite the latest result.
  const runSearch = useCallback(
    async (q: string, type: ResultType | "all") => {
      const trimmed = q.trim();
      if (!trimmed || trimmed.length < 2) {
        setResponse(null);
        setHasSearched(false);
        setLoading(false);
        return;
      }
      const id = ++reqIdRef.current;
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: trimmed, uid });
        if (type !== "all") params.set("type", type);
        const res = await api<SearchResponse>(`/api/search?${params.toString()}`);
        if (id !== reqIdRef.current) return; // stale
        setResponse(res);
        setHasSearched(true);
      } catch (err) {
        if (id !== reqIdRef.current) return;
        toast.error("Search failed", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
        setResponse(null);
        setHasSearched(true);
      } finally {
        if (id === reqIdRef.current) setLoading(false);
      }
    },
    [uid],
  );

  // Debounced search on query / activeType change.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      // Don't search for <2 chars — just clear.
      if (hasSearched) {
        setResponse(null);
        setHasSearched(false);
      }
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch(query, activeType);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeType]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(query, activeType);
  };

  const pickSuggestion = (s: string) => {
    setQuery(s);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Focus the input so the user can refine after picking.
    inputRef.current?.focus();
    runSearch(s, activeType);
  };

  const clearSearch = () => {
    setQuery("");
    setResponse(null);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const onResultClick = (r: SearchResult) => {
    toast(`Opening ${TYPE_META[r.type].label.slice(0, -1)}…`, {
      description: r.title,
    });
  };

  // Filtered results based on activeType (the API already filters server-side
  // when type is set, but we also guard client-side for the "all" case).
  const results = response?.results ?? [];
  const counts = response?.counts;
  const total = response?.total ?? 0;

  // For the "All" chip count we sum across types.
  const allCount = counts
    ? (Object.values(counts) as number[]).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-4 sm:py-6">
      {/* ── Search bar ── */}
      <form onSubmit={onSubmit} className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search your neighborhood"
          placeholder="Search your neighborhood — biryani, tutor, 2BHK, electrician, blood donor…"
          className="h-12 rounded-full border-2 pl-11 pr-11 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {/* ── Type filter chips ── */}
      <div
        className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
        role="group"
        aria-label="Filter results by type"
      >
        <FilterChip
          label="All"
          pressed={activeType === "all"}
          onClick={() => setActiveType("all")}
          count={hasSearched ? allCount : undefined}
        />
        {TYPE_ORDER.map((t) => (
          <FilterChip
            key={t}
            label={TYPE_META[t].label}
            pressed={activeType === t}
            onClick={() => setActiveType(t)}
            count={hasSearched ? counts?.[t] : undefined}
          />
        ))}
      </div>

      {/* ── Results area ── */}
      <div className="mt-4">
        {/* Loading skeleton */}
        {loading && <ResultsSkeleton />}

        {/* Initial empty state — popular suggestions */}
        {!loading && !hasSearched && (
          <EmptyState onPick={pickSuggestion} />
        )}

        {/* No results */}
        {!loading && hasSearched && total === 0 && (
          <NoResults query={response?.query ?? query} onPick={pickSuggestion} />
        )}

        {/* Results list */}
        {!loading && hasSearched && total > 0 && (
          <>
            <p className="mb-2 px-1 text-xs text-muted-foreground">
              {total} {total === 1 ? "result" : "results"}
              {activeType !== "all" ? ` in ${TYPE_META[activeType].label}` : " across your neighborhood"}
            </p>
            <ul className="space-y-2" aria-label="Search results">
              {results.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <ResultCard result={r} onClick={() => onResultClick(r)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Subcomponents
// =====================================================================

function FilterChip({
  label,
  pressed,
  onClick,
  count,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
        "min-h-[36px] min-w-[44px]", // touch target
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {label}
      {typeof count === "number" && count > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
            pressed
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ResultCard({
  result,
  onClick,
}: {
  result: SearchResult;
  onClick: () => void;
}) {
  const meta = TYPE_META[result.type];
  const Icon = meta.icon;
  const initials = result.title.slice(0, 2).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${meta.label.slice(0, -1)}: ${result.title}`}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4",
      )}
    >
      {/* Thumbnail / icon */}
      <div className="shrink-0">
        {result.imageUrl ? (
          <Avatar className="size-12 rounded-lg">
            <AvatarImage src={result.imageUrl} alt="" />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn("gap-1 px-1.5 py-0 text-[10px] uppercase", meta.badgeClass)}
          >
            <Icon className="size-3" />
            {meta.label.slice(0, -1)}
          </Badge>
        </div>
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
          {result.title}
        </h3>
        {result.subtitle && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {result.subtitle}
          </p>
        )}
      </div>

      {/* Chevron */}
      <ArrowRight
        className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
}

function ResultsSkeleton() {
  return (
    <ul className="space-y-2" aria-label="Loading results" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm sm:p-4"
        >
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <Card className="gap-0 border-dashed bg-muted/30 p-6 text-center sm:p-8">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="size-6 text-primary" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-foreground">
        Find anything in your neighborhood
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Search across posts, businesses, reels, jobs, properties, services,
        yellow pages and the marketplace — all in one place.
      </p>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Popular searches
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-accent min-h-[36px]"
            >
              <SearchIcon className="size-3 text-muted-foreground" />
              {s}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function NoResults({
  query,
  onPick,
}: {
  query: string;
  onPick: (s: string) => void;
}) {
  return (
    <Card className="gap-0 border-dashed bg-muted/30 p-6 text-center sm:p-8">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
        <SearchIcon className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-foreground">
        No results for &ldquo;{query}&rdquo; in your neighborhood
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Try a different spelling, a broader term, or pick one of these popular
        searches.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {POPULAR_SUGGESTIONS.slice(0, 4).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-accent min-h-[36px]"
          >
            <SearchIcon className="size-3 text-muted-foreground" />
            {s}
          </button>
        ))}
      </div>
    </Card>
  );
}
