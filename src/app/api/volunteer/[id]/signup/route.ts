import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const userId = url.searchParams.get("uid") || "arjun@nx.in";
  const user = await db.user.findFirst({
    where: { OR: [{ id: userId }, { email: userId }] },
  });
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  try {
    const signup = await db.volunteerSignup.create({
      data: { opportunityId: id, userId: user.id },
      include: { user: true },
    });
    const opp = await db.volunteerOpportunity.update({
      where: { id },
      data: { filled: { increment: 1 } },
      include: { signups: { include: { user: true } } },
    });
    if (opp.filled >= opp.slots) {
      await db.volunteerOpportunity.update({
        where: { id },
        data: { status: "FILLED" },
      });
    }
    return NextResponse.json({ ok: true, signup });
  } catch {
    return NextResponse.json({ error: "already signed up" }, { status: 409 });
  }
}
