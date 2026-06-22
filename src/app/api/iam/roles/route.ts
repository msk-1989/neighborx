/**
 * GET /api/iam/roles
 * Returns all role definitions (with metadata). Public-ish (any logged-in user).
 */
import { NextResponse } from "next/server";
import { ROLE_META, ALL_ROLE_CODES, USER_ROLE_CODES, ADMIN_ROLE_CODES } from "@/lib/iam/roles";

export async function GET() {
  return NextResponse.json({
    roles: ALL_ROLE_CODES.map((c) => ROLE_META[c]),
    userRoles: USER_ROLE_CODES.map((c) => ROLE_META[c]),
    adminRoles: ADMIN_ROLE_CODES.map((c) => ROLE_META[c]),
  });
}
