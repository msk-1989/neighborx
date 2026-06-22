import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/watch — list neighborhood watch alerts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  const alerts = await db.watchAlert.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
    },
    include: { reporter: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(alerts);
}

// POST /api/watch — report a new watch alert
export async function POST(req: Request) {
  const body = await req.json();
  const { type, title, description, location, severity, reporterId } = body as {
    type: string;
    title: string;
    description: string;
    location: string;
    severity: string;
    reporterId: string;
  };

  if (!title || !reporterId) {
    return NextResponse.json({ error: "title and reporterId required" }, { status: 400 });
  }

  const alert = await db.watchAlert.create({
    data: {
      type: type || "SUSPICIOUS",
      title,
      description,
      location,
      severity: severity || "MEDIUM",
      reporterId,
    },
    include: { reporter: true },
  });
  return NextResponse.json(alert);
}
