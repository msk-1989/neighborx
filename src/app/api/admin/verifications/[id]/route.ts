/**
 * PATCH /api/admin/verifications/[id]?uid=
 * Body: { status: "APPROVED" | "REJECTED", notes? }
 * Sets reviewedBy = uid, reviewedAt = now.
 * Requires VERIFY_USER.
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
    await requirePermission(uid, PERMISSION.VERIFY_USER);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const status = body?.status as "APPROVED" | "REJECTED" | undefined;
    if (!status) {
      return NextResponse.json({ error: "status required" }, { status: 400 });
    }
    const updated = await db.verificationRequest.update({
      where: { id },
      data: {
        status,
        notes: body?.notes ?? null,
        reviewedBy: uid,
        reviewedAt: new Date(),
      },
      include: {
        requester: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // If approved, mirror onto the user's verification flags
    if (status === "APPROVED" && updated.requesterId) {
      const t = updated.type;
      const patch: Record<string, boolean> = {};
      if (t === "AADHAAR") patch.verifyAadhaar = true;
      if (t === "ADDRESS") patch.verifyAddress = true;
      if (t === "BUSINESS") patch.verifyBusiness = true;
      if (Object.keys(patch).length) {
        await db.user.update({ where: { id: updated.requesterId }, data: patch });
      }
    }

    return NextResponse.json({ request: updated });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
