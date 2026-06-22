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
  const q = url.searchParams.get("q");
  const listings = await db.listing.findMany({
    where: {
      AND: [
        cat && cat !== "ALL" ? { category: cat } : {},
        q ? { title: { contains: q } } : {},
        { status: "AVAILABLE" },
      ],
    },
    include: { seller: true },
    orderBy: [{ boosted: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const listing = await db.listing.create({
    data: {
      title: body.title,
      description: body.description,
      price: Number(body.price),
      category: body.category || "ELECTRONICS",
      condition: body.condition || "Used",
      imageUrl: body.imageUrl || null,
      location: body.location || `${user.area}, ${user.city}`,
      sellerId: user.id,
      boosted: body.boosted || false,
    },
    include: { seller: true },
  });
  return NextResponse.json(listing);
}
