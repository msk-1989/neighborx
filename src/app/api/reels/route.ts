import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET(req: Request) {
  const user = await currentUser(req);

  const reels = await db.reel.findMany({
    where: { status: "ACTIVE" },
    include: {
      author: true,
      _count: { select: { reelComments: true } },
      reelLikes: user
        ? { where: { userId: user.id }, select: { id: true } }
        : false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const payload = reels.map((r) => {
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
