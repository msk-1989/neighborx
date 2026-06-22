/**
 * POST /api/admin/users/[id]/roles?uid=<adminUserId>
 * Body: { roleCode, scope?, action: "assign" | "remove" }
 * Uses assignRole / removeRole helpers from @/lib/iam/server.
 * Requires ASSIGN_ROLES permission.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignRole, removeRole, requirePermission } from "@/lib/iam/server";
import { PERMISSION, ROLE, type RoleCode } from "@/lib/iam/roles";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requirePermission(uid, PERMISSION.ASSIGN_ROLES);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const roleCode = body?.roleCode as RoleCode | undefined;
    const scope = body?.scope as string | undefined;
    const action = body?.action as "assign" | "remove" | undefined;

    if (!roleCode || !action) {
      return NextResponse.json(
        { error: "roleCode and action are required" },
        { status: 400 },
      );
    }
    if (!(roleCode in ROLE)) {
      return NextResponse.json(
        { error: `Unknown role code: ${roleCode}` },
        { status: 400 },
      );
    }

    if (action === "assign") {
      await assignRole(id, roleCode, { scope: scope || undefined, grantedBy: uid });
    } else if (action === "remove") {
      await removeRole(id, roleCode, scope || null);
    } else {
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 },
      );
    }

    // Return the updated user with their roles
    const user = await db.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: { select: { code: true, name: true, level: true, category: true } },
          },
        },
      },
    });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
