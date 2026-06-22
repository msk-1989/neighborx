import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOtp, OTP_TTL_MS } from "@/lib/auth";

/**
 * POST /api/auth/send-otp
 * Body: { email, mode: "login" | "register", name?, phone?, role? }
 *
 * For login: verifies the user exists, generates an OTP, stores it, returns
 *   the OTP in the response (for demo only — production would email/SMS it).
 * For register: verifies the user does NOT exist, generates an OTP, stores
 *   the pending registration details in the OTP row (encoded in code field)
 *   — no, simpler: we just verify the email is free, and the client re-sends
 *   the registration payload on verify-otp.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const mode = body.mode === "register" ? "register" : "login";

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (mode === "login") {
      const existing = await db.user.findUnique({ where: { email } });
      if (!existing) {
        return NextResponse.json(
          {
            error:
              "No account found with this email. Tap Register to create one.",
          },
          { status: 404 },
        );
      }
    } else {
      // register
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please login instead.",
          },
          { status: 409 },
        );
      }
      // validate name + phone
      const name = String(body.name ?? "").trim();
      const phone = String(body.phone ?? "").trim();
      if (!name || name.length < 2) {
        return NextResponse.json(
          { error: "Please enter your full name." },
          { status: 400 },
        );
      }
      if (!phone || !/^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ""))) {
        return NextResponse.json(
          { error: "Please enter a valid 10-digit phone number." },
          { status: 400 },
        );
      }
    }

    const code = generateOtp();

    // Invalidate any previous unconsumed codes for this email
    await db.otpCode.updateMany({
      where: { email, consumed: false },
      data: { consumed: true },
    });

    await db.otpCode.create({
      data: {
        email,
        code,
        purpose: mode === "register" ? "REGISTER" : "LOGIN",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    // In demo mode, return the OTP so the UI can display it (no SMS/email).
    // In production, this would be sent via SMS/email and NOT returned.
    return NextResponse.json({
      ok: true,
      mode,
      email,
      expiresIn: OTP_TTL_MS / 1000,
      // demo-only: return the OTP so the user can paste it without a real SMS gateway
      demoOtp: code,
    });
  } catch (err: any) {
    console.error("[auth/send-otp]", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to send OTP." },
      { status: 500 },
    );
  }
}
