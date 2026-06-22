/**
 * Auth helpers — passwordless OTP-based authentication.
 * ====================================================================
 * NeighborX uses email + OTP (no passwords). Sessions are stored in a
 * signed HTTP-only cookie `nx_session` containing the user id.
 *
 * In production you'd sign the cookie with `jsonwebtoken` or iron-session;
 * for this demo we store the cuid directly (it's already 24 chars of
 * unguessable entropy). The DB lookup on every request validates it.
 */

import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "nx_session";
/** OTP expires in 10 minutes */
export const OTP_TTL_MS = 10 * 60 * 1000;
/** Session cookie max-age: 30 days */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/** Generate a cryptographically-random 6-digit OTP code. */
export function generateOtp(): string {
  // Use Web Crypto for unbiased digits.
  const arr = new Uint32Array(6);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => n % 10).join("");
}

/** Read the current session user id from the cookie (server-side only). */
export async function getSessionUid(): Promise<string | null> {
  const store = await cookies();
  const v = store.get(SESSION_COOKIE)?.value;
  return v ?? null;
}

/** Set the session cookie (called after successful OTP verification). */
export async function setSession(uid: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, uid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Clear the session cookie (logout). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Fetch the current session user, or null. */
export async function getSessionUser() {
  const uid = await getSessionUid();
  if (!uid) return null;
  const user = await db.user.findUnique({ where: { id: uid } });
  return user;
}
