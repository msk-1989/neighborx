/**
 * POST /api/iam/check
 * Body: { uid, permission }
 * Returns { allowed: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { userHasPermission } from "@/lib/iam/server";

export async function POST(req: NextRequest) {
  const { uid, permission } = await req.json();
  if (!uid || !permission) {
    return NextResponse.json({ error: "uid + permission required" }, { status: 400 });
  }
  try {
    const allowed = await userHasPermission(uid, permission);
    return NextResponse.json({ allowed });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
