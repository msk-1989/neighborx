import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/groups/[id]/join?uid=xxx — join (or leave) a group
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: uid } },
  });

  if (existing) {
    if (existing.role === "OWNER") {
      return NextResponse.json({ error: "Owner cannot leave. Transfer ownership first." }, { status: 400 });
    }
    await db.groupMember.delete({ where: { id: existing.id } });
    await db.group.update({
      where: { id },
      data: { memberCount: { decrement: 1 } },
    });
    return NextResponse.json({ joined: false });
  }

  await db.groupMember.create({
    data: { groupId: id, userId: uid, role: "MEMBER" },
  });
  await db.group.update({
    where: { id },
    data: { memberCount: { increment: 1 } },
  });
  return NextResponse.json({ joined: true });
}
