/**
 * GET /api/admin/roles-matrix?uid=
 * Returns all roles with their permission codes + user count.
 * Used by the Settings → Roles & Permissions viewer.
 * Requires VIEW_ADMIN_PANEL.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/iam/server";
import { PERMISSION, ROLE_PERMISSIONS, ROLE_META, ALL_ROLE_CODES } from "@/lib/iam/roles";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requirePermission(uid, PERMISSION.VIEW_ADMIN_PANEL);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const roles = await db.role.findMany({
      orderBy: [{ category: "asc" }, { level: "asc" }],
      include: {
        permissions: {
          include: {
            permission: { select: { code: true, name: true, module: true, action: true } },
          },
        },
        _count: { select: { users: true } },
      },
    });

    // For each role, also include the static expected permissions from
    // ROLE_PERMISSIONS (for parity / migration auditing).
    const enriched = roles.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      level: r.level,
      category: r.category,
      isSystem: r.isSystem,
      userCount: r._count.users,
      permissionCount: r.permissions.length,
      permissions: r.permissions.map((rp) => rp.permission),
      expectedPermissions: ROLE_PERMISSIONS[r.code as keyof typeof ROLE_PERMISSIONS] ?? [],
      meta: ROLE_META[r.code as (typeof ALL_ROLE_CODES)[number]] ?? null,
    }));

    return NextResponse.json({ roles: enriched });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
