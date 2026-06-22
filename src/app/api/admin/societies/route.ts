/**
 * GET /api/admin/societies?uid=
 * All societies with admin + visitor + notice counts.
 * Requires MANAGE_SOCIETY (or VIEW_ADMIN_PANEL).
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
      PERMISSION.MANAGE_SOCIETY,
      PERMISSION.VIEW_ADMIN_PANEL,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const societies = await db.society.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { visitors: true, notices: true } },
      },
    });
    // Today's visitor count per society
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayVisitors = await db.visitor.groupBy({
      by: ["societyId"],
      where: { createdAt: { gte: startOfDay } },
      _count: true,
    });
    const todayMap = new Map(todayVisitors.map((v) => [v.societyId, v._count]));
    return NextResponse.json({
      societies: societies.map((s) => ({
        ...s,
        visitorsToday: todayMap.get(s.id) ?? 0,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
