/**
 * GET /api/admin/services?uid=
 * All service providers. Requires APPROVE_SERVICE_PROVIDER (or VIEW_ADMIN_PANEL).
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
      PERMISSION.APPROVE_SERVICE_PROVIDER,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const services = await db.service.findMany({
      orderBy: { rating: "desc" },
      include: { _count: { select: { bookings: true } } },
    });
    return NextResponse.json({ services });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
