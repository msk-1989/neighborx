import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET() {
  const emergencies = await db.emergency.findMany({
    include: { reporter: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 30,
  });
  return NextResponse.json(emergencies);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const em = await db.emergency.create({
    data: {
      category: body.category || "MEDICAL",
      title: body.title,
      description: body.description,
      location: body.location || `${user.area}, ${user.city}`,
      severity: body.severity || "HIGH",
      reporterId: user.id,
    },
    include: { reporter: true },
  });
  return NextResponse.json(em);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (body.action === "respond") {
    const em = await db.emergency.update({
      where: { id: body.id },
      data: { responders: { increment: 1 } },
      include: { reporter: true },
    });
    return NextResponse.json(em);
  }
  if (body.action === "resolve") {
    const em = await db.emergency.update({
      where: { id: body.id },
      data: { status: "RESOLVED" },
      include: { reporter: true },
    });
    return NextResponse.json(em);
  }
  return NextResponse.json({ error: "unknown" }, { status: 400 });
}
