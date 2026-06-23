import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const url = new URL(req.url);
  const userId = url.searchParams.get("uid") || "arjun@nx.in";
  const user = await db.user.findFirst({
    where: { OR: [{ id: userId }, { email: userId }] },
  });
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const amount = Math.max(1, Number(body.amount) || 0);
  if (!amount) {
    return NextResponse.json({ error: "invalid amount" }, { status: 400 });
  }

  const donation = await db.fundraiserDonation.create({
    data: {
      fundraiserId: id,
      donorId: user.id,
      amount,
      message: body.message || null,
      anonymous: Boolean(body.anonymous),
    },
    include: { donor: true },
  });

  const fr = await db.fundraiser.update({
    where: { id },
    data: { raised: { increment: amount } },
  });
  if (fr.raised >= fr.goal) {
    await db.fundraiser.update({
      where: { id },
      data: { status: "GOAL_REACHED" },
    });
  }
  return NextResponse.json({ ok: true, donation });
}
