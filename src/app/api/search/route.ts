import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { SearchResult, SearchResponse } from "@/lib/types";

// Match the currentUser pattern used across NeighborX APIs (feed, reels, …).
// Search doesn't strictly need auth, but keeping the pattern consistent lets
// us add personalization (area boost, saved searches) later without rewriting
// the route signature.
async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

type ResultType = SearchResult["type"];

const EMPTY_COUNTS: Record<ResultType, number> = {
  post: 0,
  business: 0,
  reel: 0,
  job: 0,
  property: 0,
  service: 0,
  yellowpage: 0,
  marketplace: 0,
};

const ALL_TYPES: ResultType[] = [
  "post",
  "business",
  "reel",
  "job",
  "property",
  "service",
  "yellowpage",
  "marketplace",
];

const TAKE = 10; // max results per type — keep payloads small

function truncate(s: string, n: number) {
  const t = (s || "").trim().replace(/\s+/g, " ");
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

// The dev server caches a single PrismaClient instance on globalThis (see
// lib/db) to survive hot reloads. If the schema is migrated while the dev
// server is running, the cached client may be missing newer models (e.g.
// yellowPageEntry right after that model is added). Feature-detect each
// delegate at runtime so the unified search degrades gracefully instead of
// 500-ing the whole request.
type Delegate = { findMany: (args: unknown) => Promise<unknown[]> };
function delegate(name: string): Delegate | undefined {
  return (db as unknown as Record<string, Delegate | undefined>)[name];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const typeParam = url.searchParams.get("type") as ResultType | null;

  // Resolve current user (for future personalization — area boost etc.)
  const user = await currentUser(req);

  // Empty / too-short queries return an empty shell. This keeps the UI in its
  // "popular suggestions" state until the user types something meaningful.
  if (!q || q.length < 2) {
    return NextResponse.json<SearchResponse>({
      query: q,
      total: 0,
      results: [],
      counts: { ...EMPTY_COUNTS },
    });
  }

  const types = typeParam && ALL_TYPES.includes(typeParam) ? [typeParam] : ALL_TYPES;

  // Run all selected searches in parallel. Each returns a typed SearchResult[]
  // (or [] if that type isn't in the filter).
  const tasks = types.map((t) => searchType(t, q, user?.id));
  const settled = await Promise.all(tasks);
  const results = settled.flat();

  // Build per-type counts (over ALL matched results, not just the slice we
  // return — the chips use these to show "Businesses (23)" etc.)
  const counts: Record<ResultType, number> = { ...EMPTY_COUNTS };
  for (const r of results) counts[r.type] += 1;

  return NextResponse.json<SearchResponse>({
    query: q,
    total: results.length,
    results,
    counts,
  });
}

// ---------------------------------------------------------------------
// Per-type searchers. Each runs a case-insensitive `contains` against the
// relevant text fields, takes TAKE rows, includes relations needed for the
// card, and maps to a SearchResult.
// ---------------------------------------------------------------------

async function searchType(
  type: ResultType,
  q: string,
  _uid: string | undefined,
): Promise<SearchResult[]> {
  switch (type) {
    case "post":
      return searchPosts(q);
    case "business":
      return searchBusinesses(q);
    case "reel":
      return searchReels(q);
    case "job":
      return searchJobs(q);
    case "property":
      return searchProperties(q);
    case "service":
      return searchServices(q);
    case "yellowpage":
      return searchYellowPages(q);
    case "marketplace":
      return searchMarketplace(q);
    default:
      return [];
  }
}

async function searchPosts(q: string): Promise<SearchResult[]> {
  if (!delegate("post")) return [];
  const rows = await db.post.findMany({
    where: {
      OR: [
        { content: { contains: q, mode: "insensitive" } },
        { tag: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: TAKE,
  });
  return rows.map((p) => ({
    type: "post" as const,
    id: p.id,
    title: truncate(p.content, 60),
    subtitle: `${p.author?.name ?? "Neighbor"} · ${timeAgoBrief(p.createdAt)}`,
    imageUrl: p.imageUrl ?? null,
    href: undefined,
    data: p,
  }));
}

async function searchBusinesses(q: string): Promise<SearchResult[]> {
  if (!delegate("business")) return [];
  const rows = await db.business.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    take: TAKE,
  });
  return rows.map((b) => ({
    type: "business" as const,
    id: b.id,
    title: b.name,
    subtitle: b.description || b.category,
    imageUrl: b.imageUrl ?? null,
    href: undefined,
    data: b,
  }));
}

async function searchReels(q: string): Promise<SearchResult[]> {
  if (!delegate("reel")) return [];
  const rows = await db.reel.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { caption: { contains: q, mode: "insensitive" } },
        { hashtags: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: TAKE,
  });
  return rows.map((r) => ({
    type: "reel" as const,
    id: r.id,
    title: truncate(r.caption, 60),
    subtitle: `${r.author?.name ?? "Neighbor"} · ${r.views} views`,
    imageUrl: r.thumbnailUrl ?? null,
    href: undefined,
    data: r,
  }));
}

async function searchJobs(q: string): Promise<SearchResult[]> {
  if (!delegate("job")) return [];
  const rows = await db.job.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { employer: true },
    orderBy: { createdAt: "desc" },
    take: TAKE,
  });
  return rows.map((j) => ({
    type: "job" as const,
    id: j.id,
    title: j.title,
    subtitle: `${j.company} · ${j.location}`,
    imageUrl: null,
    href: undefined,
    data: j,
  }));
}

async function searchProperties(q: string): Promise<SearchResult[]> {
  if (!delegate("propertyListing")) return [];
  const rows = await db.propertyListing.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { propertyType: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    take: TAKE,
  });
  return rows.map((p) => ({
    type: "property" as const,
    id: p.id,
    title: p.title,
    subtitle: `${p.propertyType} · ₹${p.rent || p.price}`,
    imageUrl: p.imageUrl ?? null,
    href: undefined,
    data: p,
  }));
}

async function searchServices(q: string): Promise<SearchResult[]> {
  if (!delegate("service")) return [];
  // The Service model is the canonical services directory (plumbers, tutors,
  // electricians…). We search providerName, bio, and category.
  const rows = await db.service.findMany({
    where: {
      OR: [
        { providerName: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { rating: "desc" },
    take: TAKE,
  });
  return rows.map((s) => ({
    type: "service" as const,
    id: s.id,
    title: s.providerName,
    subtitle: `${s.category} · ⭐ ${s.rating} · ${s.jobsDone} jobs`,
    imageUrl: s.avatar ?? null,
    href: undefined,
    data: s,
  }));
}

async function searchYellowPages(q: string): Promise<SearchResult[]> {
  if (!delegate("yellowPageEntry")) return [];
  const rows = await db.yellowPageEntry.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { subcategory: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { area: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ verified: "desc" }, { rating: "desc" }],
    take: TAKE,
  });
  return rows.map((y) => ({
    type: "yellowpage" as const,
    id: y.id,
    title: y.name,
    subtitle: `${y.subcategory} · ${y.area}`,
    imageUrl: y.imageUrl ?? null,
    href: undefined,
    data: y,
  }));
}

async function searchMarketplace(q: string): Promise<SearchResult[]> {
  if (!delegate("listing")) return [];
  const rows = await db.listing.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { seller: true },
    orderBy: { createdAt: "desc" },
    take: TAKE,
  });
  return rows.map((l) => ({
    type: "marketplace" as const,
    id: l.id,
    title: l.title,
    subtitle: `₹${l.price} · ${l.condition}`,
    imageUrl: l.imageUrl ?? null,
    href: undefined,
    data: l,
  }));
}

// Compact relative-time for subtitles (the full timeAgo lives in lib/types
// but pulling that in here would couple the API route to client helpers).
function timeAgoBrief(iso: Date | string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
