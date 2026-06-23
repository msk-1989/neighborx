import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const urgency = url.searchParams.get("urgency");
  const q = url.searchParams.get("q");
  const listings = await db.volunteerOpportunity.findMany({
    where: {
      AND: [
        type && type !== "ALL" ? { type } : {},
        urgency && urgency !== "ALL" ? { urgency } : {},
        q ? { title: { contains: q } } : {},
        { status: "OPEN" },
      ],
    },
    include: { organizer: true, signups: { include: { user: true } } },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const opp = await db.volunteerOpportunity.create({
    data: {
      title: body.title,
      description: body.description,
      type: body.type || "OTHER",
      location: body.location || `${user.area}, ${user.city}`,
      urgency: body.urgency || "MEDIUM",
      date: body.date || null,
      contactInfo: body.contactInfo || user.phone || user.email,
      slots: Number(body.slots) || 1,
      organizerId: user.id,
    },
    include: { organizer: true, signups: { include: { user: true } } },
  });
  return NextResponse.json(opp);
}
