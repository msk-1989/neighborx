import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const reel = await db.reel.findUnique({ where: { id } });
  if (!reel) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (reel.authorId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Cascade on ReelLike + ReelComment will clean up children automatically.
  await db.reel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
