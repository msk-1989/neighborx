/**
 * PATCH /api/admin/emergencies/[id]?uid=
 * Body: { status } — "ACTIVE" | "RESOLVED".
 * Requires VERIFY_ALERT (or VIEW_SOS).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAnyPermission } from "@/lib/iam/server";
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
    await requireAnyPermission(uid, [
      PERMISSION.VERIFY_ALERT,
      PERMISSION.VIEW_SOS,
    ]);
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

    // Try emergency first, fall back to watch alert
    let updated: Record<string, unknown> | null = null;
    const e = await db.emergency.findUnique({ where: { id } });
    if (e) {
      updated = await db.emergency.update({ where: { id }, data: { status } });
    } else {
      const w = await db.watchAlert.findUnique({ where: { id } });
      if (w) {
        updated = await db.watchAlert.update({ where: { id }, data: { status } });
      } else {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
    }
    return NextResponse.json({ item: updated });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
