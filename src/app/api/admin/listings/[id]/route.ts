/**
 * DELETE /api/admin/listings/[id]?uid=<adminUserId>  — delete any listing
 * PATCH  /api/admin/listings/[id]?uid=<adminUserId>  — { boosted?, status? }
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, requireAnyPermission } from "@/lib/iam/server";
import { PERMISSION } from "@/lib/iam/roles";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requirePermission(uid, PERMISSION.DELETE_ANY_LISTING);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await db.listing.delete({ where: { id } });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}

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
      PERMISSION.DELETE_ANY_LISTING,
      PERMISSION.VIEW_ADMIN_PANEL,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body?.boosted === "boolean") data.boosted = body.boosted;
    if (typeof body?.status === "string") data.status = body.status;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "nothing to update" }, { status: 400 });
    }
    const updated = await db.listing.update({ where: { id }, data });
    return NextResponse.json({ listing: updated });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
