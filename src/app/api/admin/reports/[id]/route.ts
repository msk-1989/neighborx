/**
 * PATCH /api/admin/reports/[id]?uid=
 * Body: { status, action? } — status: REVIEWING | ACTIONED | DISMISSED
 *       action: NONE | WARNING | CONTENT_REMOVED | USER_SUSPENDED | USER_BANNED
 * Sets handlerId = uid, handledAt = now.
 * Requires REVIEW_REPORTS.
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
    await requirePermission(uid, PERMISSION.REVIEW_REPORTS);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const status = body?.status as string | undefined;
    if (!status) {
      return NextResponse.json({ error: "status required" }, { status: 400 });
    }
    const data: Record<string, unknown> = {
      status,
      handlerId: uid,
      handledAt: new Date(),
    };
    if (typeof body?.action === "string") data.action = body.action;

    const updated = await db.abuseReport.update({
      where: { id },
      data,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        handler: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ report: updated });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
