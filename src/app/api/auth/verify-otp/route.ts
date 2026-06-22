import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
import { assignRole } from "@/lib/iam/server";
import { ROLE } from "@/lib/iam/roles";

/**
 * POST /api/auth/verify-otp
 * Body: { email, code, mode, name?, phone?, role? }
 *
 * Validates the OTP. On success:
 *   - LOGIN: sets the session cookie, returns the user
 *   - REGISTER: creates the user (with the chosen role), assigns the
 *     matching IAM role, sets the session cookie, returns the user
 */
const VALID_REGISTER_ROLES: Record<string, string> = {
  RESIDENT: ROLE.RESIDENT,
  BUSINESS_OWNER: ROLE.BUSINESS_OWNER,
  SERVICE_PROVIDER: ROLE.SERVICE_PROVIDER,
  EMPLOYER: ROLE.EMPLOYER,
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();
    const mode = body.mode === "register" ? "register" : "login";

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required." },
        { status: 400 },
      );
    }

    // Find the most recent unconsumed OTP for this email
    const otp = await db.otpCode.findFirst({
      where: { email, consumed: false, code },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please check and try again." },
        { status: 400 },
      );
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      await db.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
      return NextResponse.json(
        { error: "This OTP has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Verify mode matches the OTP purpose
    const expectedPurpose = mode === "register" ? "REGISTER" : "LOGIN";
    if (otp.purpose !== expectedPurpose) {
      return NextResponse.json(
        {
          error:
            mode === "register"
              ? "This OTP was sent for login. Please login instead."
              : "This OTP was sent for registration. Please register instead.",
        },
        { status: 400 },
      );
    }

    // Mark OTP as consumed
    await db.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });

    let user;

    if (mode === "register") {
      const name = String(body.name ?? "").trim();
      const phoneRaw = String(body.phone ?? "").trim();
      const phone = phoneRaw.replace(/[^0-9]/g, "");
      const requestedRole = VALID_REGISTER_ROLES[String(body.role ?? "RESIDENT")] ?? ROLE.RESIDENT;

      if (!name || name.length < 2) {
        return NextResponse.json(
          { error: "Please enter your full name." },
          { status: 400 },
        );
      }
      if (!phone || phone.length !== 10) {
        return NextResponse.json(
          { error: "Please enter a valid 10-digit phone number." },
          { status: 400 },
        );
      }

      // Race-condition guard: re-check email uniqueness
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Account already exists. Please login." },
          { status: 409 },
        );
      }

      user = await db.user.create({
        data: {
          name,
          email,
          phone,
          role: requestedRole,
          verifyMobile: true, // they verified via OTP (mocked as SMS)
          verifyEmail: false,
          rewardPoints: 10, // welcome bonus
        },
      });

      // Assign the matching IAM role
      try {
        await assignRole(user.id, requestedRole);
      } catch (e) {
        console.warn("[auth/verify-otp] assignRole failed:", e);
      }
    } else {
      // login
      user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { error: "Account not found. Please register." },
          { status: 404 },
        );
      }
    }

    await setSession(user.id);

    // Serialize the user for the client
    const safeUser = JSON.parse(JSON.stringify(user));
    return NextResponse.json({
      ok: true,
      user: safeUser,
    });
  } catch (err: any) {
    console.error("[auth/verify-otp]", err);
    return NextResponse.json(
      { error: err?.message ?? "Verification failed." },
      { status: 500 },
    );
  }
}
