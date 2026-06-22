/**
 * GET /api/admin/emergencies?uid=
 * All emergencies + watch alerts combined into one list.
 * Requires VIEW_SOS (or VIEW_ADMIN_PANEL).
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
      PERMISSION.VIEW_SOS,
      PERMISSION.VIEW_ADMIN_PANEL,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [emergencies, watchAlerts] = await Promise.all([
      db.emergency.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      db.watchAlert.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
    ]);
    return NextResponse.json({ emergencies, watchAlerts });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
