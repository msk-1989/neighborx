import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const complaints = await db.complaint.findMany({
    where: status && status !== "ALL" ? { status } : {},
    include: { reporter: true },
    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(complaints);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const c = await db.complaint.create({
    data: {
      category: body.category || "OTHER",
      title: body.title,
      description: body.description,
      location: body.location || `${user.area}, ${user.city}`,
      imageUrl: body.imageUrl || null,
      aiCategory: body.aiCategory || null,
      aiConfidence: body.aiConfidence ?? null,
      reporterId: user.id,
    },
    include: { reporter: true },
  });
  return NextResponse.json(c);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (body.action === "upvote") {
    const c = await db.complaint.update({
      where: { id: body.id },
      data: { upvotes: { increment: 1 } },
      include: { reporter: true },
    });
    return NextResponse.json(c);
  }
  if (body.action === "status") {
    const c = await db.complaint.update({
      where: { id: body.id },
      data: { status: body.status },
      include: { reporter: true },
    });
    return NextResponse.json(c);
  }
  return NextResponse.json({ error: "unknown" }, { status: 400 });
}
