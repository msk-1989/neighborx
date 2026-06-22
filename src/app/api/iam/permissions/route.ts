/**
 * GET /api/iam/permissions
 * Returns all permission definitions, grouped by module.
 */
import { NextResponse } from "next/server";
import { PERMISSION_META, ALL_PERMISSION_CODES } from "@/lib/iam/roles";

export async function GET() {
  const byModule: Record<string, typeof PERMISSION_META[keyof typeof PERMISSION_META][]> = {};
  for (const code of ALL_PERMISSION_CODES) {
    const meta = PERMISSION_META[code];
    if (!byModule[meta.module]) byModule[meta.module] = [];
    byModule[meta.module].push(meta);
  }
  return NextResponse.json({
    permissions: ALL_PERMISSION_CODES.map((c) => PERMISSION_META[c]),
    byModule,
  });
}
