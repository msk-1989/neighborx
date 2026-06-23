import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

/**
 * GET /api/society/visitor?uid=
 * Returns visitor passes belonging to this user (hostName matches user.name)
 * OR visitors for the user's society. Ordered by createdAt desc.
 */
export async function GET(req: Request) {
  const user = await currentUser(req);
  if (!user) return NextResponse.json([]);

  const society = await db.society.findFirst({
    where: { name: user.society || "Royal Residency" },
    select: { id: true },
  });

  const visitors = await db.visitor.findMany({
    where: {
      OR: [
        { hostName: user.name },
        ...(society ? [{ societyId: society.id }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(visitors);
}

/**
 * POST /api/society/visitor?uid=
 * Body: { visitorName, visitorPhone, hostName, hostFlat, purpose }
 * Creates a visitor pass with status APPROVED (pre-approved entry).
 */
export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const societyName = user.society || "Royal Residency";
  let society = await db.society.findFirst({
    where: { name: societyName },
    select: { id: true },
  });
  if (!society) {
    society = await db.society.create({
      data: {
        name: societyName,
        address: `${user.area}, ${user.city}`,
        area: user.area,
        city: user.city,
      },
      select: { id: true },
    });
  }

  const visitor = await db.visitor.create({
    data: {
      societyId: society.id,
      visitorName: String(body.visitorName || "").trim(),
      visitorPhone: body.visitorPhone || null,
      hostName: body.hostName || user.name,
      hostFlat: String(body.hostFlat || "").trim(),
      purpose: body.purpose || null,
      status: "APPROVED",
    },
  });

  return NextResponse.json(visitor);
}
