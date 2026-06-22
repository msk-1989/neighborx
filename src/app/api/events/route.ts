import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const events = await db.event.findMany({
    include: { organizer: true, rsvps: { select: { id: true, status: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}
