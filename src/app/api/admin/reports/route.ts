/**
 * GET /api/admin/reports?uid=
 * All abuse reports with reporter + handler.
 * Requires REVIEW_REPORTS (or VIEW_ADMIN_PANEL).
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
      PERMISSION.REVIEW_REPORTS,
      PERMISSION.VIEW_ADMIN_PANEL,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const reports = await db.abuseReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        handler: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ reports });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
