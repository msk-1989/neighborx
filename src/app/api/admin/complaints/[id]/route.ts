/**
 * PATCH /api/admin/complaints/[id]?uid=
 * Body: { status } — SUBMITTED | IN_PROGRESS | RESOLVED
 * Requires MANAGE_COMPLAINTS.
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
    await requirePermission(uid, PERMISSION.MANAGE_COMPLAINTS);
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
    const updated = await db.complaint.update({ where: { id }, data: { status } });
    return NextResponse.json({ complaint: updated });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
