/**
 * GET /api/admin/posts?uid=&limit=50&offset=0&type=&scope=
 * All posts with author. Requires VIEW_ADMIN_PANEL (or DELETE_ANY_POST).
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
      PERMISSION.MODERATE_POSTS,
      PERMISSION.DELETE_ANY_POST,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const limit = Math.min(200, Number(req.nextUrl.searchParams.get("limit") || 50));
    const offset = Number(req.nextUrl.searchParams.get("offset") || 0);
    const type = req.nextUrl.searchParams.get("type") || undefined;
    const scope = req.nextUrl.searchParams.get("scope") || undefined;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (scope) where.scope = scope;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: { author: true, _count: { select: { comments: true } } },
      }),
      db.post.count({ where }),
    ]);
    return NextResponse.json({ posts, total });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
