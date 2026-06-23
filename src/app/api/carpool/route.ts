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
  const q = url.searchParams.get("q");
  const rides = await db.carpoolRide.findMany({
    where: {
      AND: [
        type && type !== "ALL" ? { type } : {},
        q
          ? {
              OR: [
                { fromLocation: { contains: q } },
                { toLocation: { contains: q } },
                { notes: { contains: q } },
              ],
            }
          : {},
        { status: "OPEN" },
      ],
    },
    include: { driver: true },
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json(rides);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const ride = await db.carpoolRide.create({
    data: {
      type: body.type || "OFFER",
      fromLocation: body.fromLocation,
      toLocation: body.toLocation,
      date: body.date,
      time: body.time,
      seats: Number(body.seats) || 1,
      seatsFilled: 0,
      recurring: body.recurring || "One-time",
      notes: body.notes || null,
      contribution: Number(body.contribution) || 0,
      status: "OPEN",
      driverId: user.id,
    },
    include: { driver: true },
  });
  return NextResponse.json(ride);
}
