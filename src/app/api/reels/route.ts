import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

/**
 * GET /api/reels?uid=<id>
 *
 * Hyperlocal AI recommendation: reels are ranked by proximity to the viewer,
 * NOT by global popularity (this is what keeps NeighborX neighborhood-first
 * instead of becoming another Instagram).
 *
 * Ranking tiers (each tier sorted by recency within):
 *   Tier 0 — same society  (e.g. Royal Residency)
 *   Tier 1 — same area     (e.g. Khair Nagar)
 *   Tier 2 — same city     (e.g. Udgir)
 *   Tier 3 — nearby cities (everything else)
 *
 * Optional filters:
 *   ?category=FOOD       — filter to a single category
 *   ?following=true      — only reels from authors the viewer follows (TODO)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryFilter = url.searchParams.get("category");
  const user = await currentUser(req);

  const reels = await db.reel.findMany({
    where: {
      status: "ACTIVE",
      ...(categoryFilter ? { category: categoryFilter } : {}),
    },
    include: {
      author: true,
      _count: { select: { reelComments: true } },
      reelLikes: user
        ? { where: { userId: user.id }, select: { id: true } }
        : false,
    },
    // fetch a wider pool so the proximity sort has material to work with
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  // ── Proximity ranking ──
  // Lower tier = closer to viewer = shown first.
  const tier = (authorSociety: string, authorArea: string, authorCity: string): number => {
    if (!user) return 3;
    if (authorSociety === user.society) return 0;
    if (authorArea === user.area) return 1;
    if (authorCity === user.city) return 2;
    return 3;
  };

  const sorted = [...reels].sort((a, b) => {
    const ta = tier(a.author.society, a.author.area, a.author.city);
    const tb = tier(b.author.society, b.author.area, b.author.city);
    if (ta !== tb) return ta - tb;
    // within the same tier, newest first
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const payload = sorted.map((r) => {
    const { reelLikes, ...rest } = r;
    return {
      ...rest,
      commentCount: r._count.reelComments,
      isLiked: user ? reelLikes && reelLikes.length > 0 : false,
    };
  });

  return NextResponse.json(payload);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const reel = await db.reel.create({
    data: {
      videoUrl: body.videoUrl,
      caption: body.caption || "",
      music: body.music || null,
      hashtags: body.hashtags || null,
      thumbnailUrl: body.thumbnailUrl || null,
      category: body.category || "COMMUNITY",
      status: "ACTIVE",
      authorId: user.id,
    },
    include: { author: true },
  });

  return NextResponse.json(reel);
}
