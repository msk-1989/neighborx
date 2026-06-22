/**
 * GET /api/admin/locations?uid=
 * All location master entries (countries/states/cities/areas).
 * Requires MANAGE_LOCATIONS (or VIEW_ADMIN_PANEL).
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
      PERMISSION.MANAGE_LOCATIONS,
      PERMISSION.VIEW_ADMIN_PANEL,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const locations = await db.location.findMany({
      orderBy: [{ level: "asc" }, { name: "asc" }],
    });
    // Group by level for the UI tree view
    const grouped: Record<string, typeof locations> = {
      COUNTRY: [],
      STATE: [],
      CITY: [],
      AREA: [],
    };
    for (const l of locations) {
      (grouped[l.level] ||= []).push(l);
    }
    return NextResponse.json({ locations, grouped });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
