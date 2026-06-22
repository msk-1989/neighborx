/**
 * PATCH /api/admin/users/[id]?uid=<adminUserId>
 * Body: { action: "verify" | "unverify" }
 *   - verify:   sets verifyEmail = true (admin-granted trust)
 *   - unverify: sets verifyEmail = false
 * Requires VERIFY_USER permission.
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
      PERMISSION.VERIFY_USER,
      PERMISSION.MANAGE_USERS,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const action = body?.action as string | undefined;

    if (action === "verify") {
      const updated = await db.user.update({
        where: { id },
        data: { verifyEmail: true },
      });
      return NextResponse.json({ user: updated });
    }
    if (action === "unverify") {
      const updated = await db.user.update({
        where: { id },
        data: { verifyEmail: false },
      });
      return NextResponse.json({ user: updated });
    }
    if (action === "verifyMobile") {
      const updated = await db.user.update({
        where: { id },
        data: { verifyMobile: true },
      });
      return NextResponse.json({ user: updated });
    }
    if (action === "unverifyMobile") {
      const updated = await db.user.update({
        where: { id },
        data: { verifyMobile: false },
      });
      return NextResponse.json({ user: updated });
    }
    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
