import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/reels/[id]/view — increment views by 1. No auth needed.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reelId } = await params;

  const reel = await db.reel.findUnique({ where: { id: reelId } });
  if (!reel) return NextResponse.json({ error: "not found" }, { status: 404 });

  const updated = await db.reel.update({
    where: { id: reelId },
    data: { views: { increment: 1 } },
  });

  return NextResponse.json({ views: updated.views });
}
