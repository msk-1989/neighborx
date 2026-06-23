import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cat = url.searchParams.get("category");
  const type = url.searchParams.get("type");
  const q = url.searchParams.get("q");
  const items = await db.borrowItem.findMany({
    where: {
      AND: [
        cat && cat !== "ALL" ? { category: cat } : {},
        type && type !== "ALL" ? { type } : {},
        q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {},
        { status: "AVAILABLE" },
      ],
    },
    include: { owner: true },
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const item = await db.borrowItem.create({
    data: {
      title: body.title,
      description: body.description || "",
      category: body.category || "OTHER",
      type: body.type || "LEND",
      condition: body.condition || "Good",
      imageUrl: body.imageUrl || null,
      dailyRate: Number(body.dailyRate) || 0,
      deposit: Number(body.deposit) || 0,
      duration: body.duration || "7 days",
      location: body.location || `${user.area}, ${user.city}`,
      ownerId: user.id,
    },
    include: { owner: true },
  });
  return NextResponse.json(item);
}
