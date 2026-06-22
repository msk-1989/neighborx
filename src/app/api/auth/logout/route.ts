import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

/** POST /api/auth/logout — clears the session cookie. */
export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Logout failed." },
      { status: 500 },
    );
  }
}
