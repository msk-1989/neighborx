/**
 * GET /api/admin/visitors?uid=&limit=50
 * Recent visitors across all societies. Requires MANAGE_VISITORS (or VIEW_ADMIN_PANEL).
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
      PERMISSION.MANAGE_VISITORS,
      PERMISSION.VIEW_ADMIN_PANEL,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const limit = Math.min(200, Number(req.nextUrl.searchParams.get("limit") || 50));
    const visitors = await db.visitor.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        society: { select: { id: true, name: true, area: true, city: true } },
      },
    });
    return NextResponse.json({ visitors });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
