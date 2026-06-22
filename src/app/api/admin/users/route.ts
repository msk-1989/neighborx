/**
 * GET /api/admin/users?uid=&q=&role=&limit=50&offset=0
 * Paginated list of all users with their roles.
 * Requires MANAGE_USERS permission.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/iam/server";
import { PERMISSION } from "@/lib/iam/roles";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requirePermission(uid, PERMISSION.MANAGE_USERS);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    const role = req.nextUrl.searchParams.get("role")?.trim();
    const limit = Math.min(200, Number(req.nextUrl.searchParams.get("limit") || 50));
    const offset = Number(req.nextUrl.searchParams.get("offset") || 0);

    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ];
    }
    if (role) {
      where.roles = { some: { role: { code: role } } };
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          roles: {
            include: {
              role: { select: { code: true, name: true, level: true, category: true } },
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, limit, offset });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
