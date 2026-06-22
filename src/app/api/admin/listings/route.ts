/**
 * GET /api/admin/listings?uid=
 * All marketplace listings with seller. Requires VIEW_ADMIN_PANEL (or DELETE_ANY_LISTING).
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
      PERMISSION.DELETE_ANY_LISTING,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const listings = await db.listing.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    return NextResponse.json({ listings });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
