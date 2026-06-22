/**
 * PATCH /api/admin/tickets/[id]?uid=
 * Body: { status?, priority?, assigneeId?, resolution? }
 * Requires HANDLE_TICKETS.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/iam/server";
import { PERMISSION } from "@/lib/iam/roles";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requirePermission(uid, PERMISSION.HANDLE_TICKETS);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body?.status === "string") data.status = body.status;
    if (typeof body?.priority === "string") data.priority = body.priority;
    if (typeof body?.assigneeId === "string") data.assigneeId = body.assigneeId;
    if (typeof body?.resolution === "string") data.resolution = body.resolution;
    if (data.status === "RESOLVED" && !data.resolution) {
      data.resolution = "Resolved by support admin";
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "nothing to update" }, { status: 400 });
    }

    const updated = await db.supportTicket.update({
      where: { id },
      data,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ ticket: updated });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
