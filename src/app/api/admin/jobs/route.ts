/**
 * GET /api/admin/jobs?uid=
 * All jobs with employer + application count.
 * Requires VIEW_ADMIN_PANEL.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/iam/server";
import { PERMISSION } from "@/lib/iam/roles";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requirePermission(uid, PERMISSION.VIEW_ADMIN_PANEL);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const jobs = await db.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        employer: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { applications: true } },
      },
    });
    return NextResponse.json({ jobs });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
