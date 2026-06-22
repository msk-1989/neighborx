import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/** GET /api/auth/session — returns the current user or { user: null }. */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    const safeUser = JSON.parse(JSON.stringify(user));
    return NextResponse.json({ user: safeUser });
  } catch (err: any) {
    console.error("[auth/session]", err);
    return NextResponse.json(
      { user: null, error: err?.message ?? "Session fetch failed." },
      { status: 200 },
    );
  }
}
