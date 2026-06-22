/**
 * GET /api/iam/me
 * Returns the current user's role codes + effective permissions.
 * Query: ?uid=<userId>
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserRoleCodes, getUserPermissions } from "@/lib/iam/server";
import { ROLE_META } from "@/lib/iam/roles";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    const roles = await getUserRoleCodes(uid);
    const permissions = await getUserPermissions(uid);
    const roleMeta = roles
      .map((r) => ROLE_META[r as keyof typeof ROLE_META])
      .filter(Boolean)
      .sort((a, b) => (b?.level ?? 0) - (a?.level ?? 0));
    return NextResponse.json({ roles, permissions, roleMeta });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
