import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type"); // LOST | FOUND
  const items = await db.lostFound.findMany({
    where: {
      AND: [{ status: "OPEN" }, type && type !== "ALL" ? { type } : {}],
    },
    include: { reporter: true },
    orderBy: [{ reward: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const lf = await db.lostFound.create({
    data: {
      type: body.type || "LOST",
      category: body.category || "OTHER",
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl || null,
      location: body.location || `${user.area}, ${user.city}`,
      reward: Number(body.reward) || 0,
      reporterId: user.id,
    },
    include: { reporter: true },
  });
  return NextResponse.json(lf);
}
