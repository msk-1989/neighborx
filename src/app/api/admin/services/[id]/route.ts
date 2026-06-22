/**
 * PATCH /api/admin/services/[id]?uid=
 * Body: { verified?, available? } — toggle booleans.
 * Requires APPROVE_SERVICE_PROVIDER.
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
    await requirePermission(uid, PERMISSION.APPROVE_SERVICE_PROVIDER);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, boolean> = {};
    if (typeof body?.verified === "boolean") data.verified = body.verified;
    if (typeof body?.available === "boolean") data.available = body.available;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update (pass verified and/or available)" },
        { status: 400 },
      );
    }

    const updated = await db.service.update({ where: { id }, data });
    return NextResponse.json({ service: updated });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
