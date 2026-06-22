import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const body = await req.json();
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") || "arjun@nx.in";
  const user = await db.user.findFirst({ where: { OR: [{ id: uid }, { email: uid }] } });
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  // upsert RSVP
  const existing = await db.rSVP.findFirst({ where: { eventId, userId: user.id } });
  let rsvp;
  if (existing) {
    rsvp = await db.rSVP.update({ where: { id: existing.id }, data: { status: body.status || "GOING" } });
  } else {
    rsvp = await db.rSVP.create({ data: { eventId, userId: user.id, status: body.status || "GOING" } });
  }
  return NextResponse.json(rsvp);
}
