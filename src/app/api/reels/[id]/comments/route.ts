import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

// GET /api/reels/[id]/comments — oldest first, with author
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reelId } = await params;
  const comments = await db.reelComment.findMany({
    where: { reelId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

// POST /api/reels/[id]/comments?uid=<userId> — body { content }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reelId } = await params;
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const content = (body.content || "").toString().trim();
  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const comment = await db.reelComment.create({
    data: { content, reelId, authorId: user.id },
    include: { author: true },
  });

  return NextResponse.json(comment);
}
