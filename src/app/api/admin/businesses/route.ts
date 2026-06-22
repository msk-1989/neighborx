/**
 * GET /api/admin/businesses?uid=
 * All businesses with owner. Requires APPROVE_BUSINESS (or VIEW_ADMIN_PANEL).
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
      PERMISSION.VIEW_ADMIN_PANEL,
      PERMISSION.APPROVE_BUSINESS,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const businesses = await db.business.findMany({
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    return NextResponse.json({ businesses });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
