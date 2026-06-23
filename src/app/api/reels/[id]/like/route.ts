import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

// POST /api/reels/[id]/like?uid=<userId> — TOGGLE like
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reelId } = await params;
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const existing = await db.reelLike.findUnique({
    where: { reelId_userId: { reelId, userId: user.id } },
  });

  if (existing) {
    await db.reelLike.delete({ where: { id: existing.id } });
    const updated = await db.reel.update({
      where: { id: reelId },
      data: { likes: { decrement: 1 } },
    });
    return NextResponse.json({ liked: false, likes: Math.max(0, updated.likes) });
  }

  await db.reelLike.create({ data: { reelId, userId: user.id } });
  const updated = await db.reel.update({
    where: { id: reelId },
    data: { likes: { increment: 1 } },
  });
  return NextResponse.json({ liked: true, likes: updated.likes });
}
