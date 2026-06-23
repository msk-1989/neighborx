# Task 4-b — Neighborhood Search Engine

Agent: search-engine-builder
Scope: unified search API + frontend module for NeighborX

## Files produced
- `src/app/api/search/route.ts` (new)
- `src/components/nx/modules/search.tsx` (overwrote placeholder)

## API — GET /api/search?q=<query>&uid=<id>&type=<optional>
- Searches 8 models in parallel: Post, Business, Reel, Job, PropertyListing, Service, YellowPageEntry, Listing.
- Each uses case-insensitive `contains` on relevant text fields, take 10, includes relations.
- Returns `SearchResponse` with `query`, `total`, `results[]` (each with type/id/title/subtitle/imageUrl/data), and `counts` per type.
- `?type=` filter restricts to one type.
- `<2 chars` → empty shell.
- Runtime feature-detect on each `db.<model>` delegate (defensive against schema-migration windows — see deviation #1).

## Frontend — NeighborhoodSearch({ uid })
- Auto-focused rounded-full search bar with hyperlocal placeholder.
- Type filter chips (All + 8 types) with live counts; aria-pressed; mobile horizontal scroll / desktop wrap.
- Empty state with 6 popular suggestion chips (biryani, math tutor, 2 BHK rent, blood donor, electrician, doctor).
- 6 skeleton cards while loading.
- Flat `<ul>` of `ResultCard` buttons: 48x48 thumbnail (Avatar or icon), colored type Badge, line-clamp title/subtitle, hover chevron. Click toasts "Opening <type>…".
- No-results card with 4 suggestion chips.
- 350ms debounce (useRef + setTimeout), stale-response guard via reqIdRef. Search on Enter / debounce / suggestion-click.
- Type badge colors: post=blue, business=emerald, reel=fuchsia, job=amber, property=orange, yellowpage=purple, marketplace=cyan, service=rose.
- Max-width 640px, mobile-first.

## Verification
- `GET /api/search?q=doctor&uid=arjun@nx.in` → HTTP 200, 1 result (Rao Clinic business).
- `GET /api/search?q=biryani&uid=arjun@nx.in` → HTTP 200, 0 results (no biryani in seed data).
- `GET /api/search?q=electrician&type=service` → HTTP 200, 1 result (Sneha Patil).
- `GET /api/search?q=ar` → HTTP 200, 26 results across multiple types.
- Home page (`GET /`) → HTTP 200, search module wired in app-shell.tsx (line 35 + 132), compiles cleanly.

## Deviations
1. **YellowPageEntry runtime unavailable** in the dev server's cached PrismaClient (model added to schema at 16:27, dev server started at 15:30, globalForPrisma cache persists). Added `delegate(name)` feature-detect; yellowpage returns [] until dev server restart. Other 7 types work now. Main agent should restart `bun run dev` at end-of-session to activate yellowpage search.
2. Service badge color = rose (spec listed 7 colors, service was implicit 8th).
3. Real dev server log is `/tmp/nx-dev.log` (dev server's fd 1/2 → /tmp/nx-dev.log via /proc/17264/fd). `/home/z/my-project/dev.log` is stale (last write 15:31).

## Notes for next agent
- Search module is wired in app-shell.tsx (line 35 import, line 132 render). No app-shell changes needed.
- Did NOT modify prisma/schema.prisma or src/lib/types.ts (SearchResult/SearchResponse were already there).
- Did NOT run `bun run lint` (per task instructions; main agent will lint at end).
