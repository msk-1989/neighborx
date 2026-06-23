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
  const mode = url.searchParams.get("mode");
  const q = url.searchParams.get("q");
  const items = await db.skillListing.findMany({
    where: {
      AND: [
        cat && cat !== "ALL" ? { category: cat } : {},
        mode && mode !== "ALL" ? { mode } : {},
        q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {},
        { status: "ACTIVE" },
      ],
    },
    include: { teacher: true },
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const item = await db.skillListing.create({
    data: {
      title: body.title,
      description: body.description || "",
      category: body.category || "OTHER",
      mode: body.mode || "BOTH",
      level: body.level || "BEGINNER",
      rate: Number(body.rate) || 0,
      location: body.location || `${user.area}, ${user.city}`,
      availability: body.availability || "Weekends",
      teacherId: user.id,
    },
    include: { teacher: true },
  });
  return NextResponse.json(item);
}

// Force rebuild — Vercel was not picking up this route.
