import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "arjun@nx.in";
  const user = await db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "arjun@nx.in";
  const user = await db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name: body.name ?? user.name,
      bio: body.bio ?? user.bio,
      phone: body.phone ?? user.phone,
      area: body.area ?? user.area,
      society: body.society ?? user.society,
      verifyEmail: body.verifyEmail ?? user.verifyEmail,
      verifyAadhaar: body.verifyAadhaar ?? user.verifyAadhaar,
      verifyAddress: body.verifyAddress ?? user.verifyAddress,
      verifyBusiness: body.verifyBusiness ?? user.verifyBusiness,
      rewardPoints: body.rewardPoints ?? user.rewardPoints,
    },
  });
  return NextResponse.json(updated);
}
