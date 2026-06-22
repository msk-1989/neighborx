/**
 * GET /api/admin/tickets?uid=
 * All support tickets with requester + assignee.
 * Requires HANDLE_TICKETS (or VIEW_ADMIN_PANEL).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAnyPermission } from "@/lib/iam/server";
import { PERMISSION } from "@/lib/iam/roles";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requireAnyPermission(uid, [
      PERMISSION.HANDLE_TICKETS,
      PERMISSION.VIEW_ADMIN_PANEL,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const tickets = await db.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { id: true, name: true, email: true, avatar: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ tickets });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
