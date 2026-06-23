import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

/**
 * GET /api/yellow-pages?category=<cat>&subcategory=<sub>&q=<search>&uid=<id>
 *
 * Hyperlocal directory — pure discovery layer. Returns entries ordered by
 * verified DESC, rating DESC, createdAt DESC.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const subcategory = url.searchParams.get("subcategory");
  const q = url.searchParams.get("q");

  const entries = await db.yellowPageEntry.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(subcategory ? { subcategory } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { subcategory: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ verified: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json(entries);
}

/**
 * POST /api/yellow-pages?uid=<id> — any logged-in user can add a listing.
 */
export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const entry = await db.yellowPageEntry.create({
    data: {
      name: body.name,
      category: body.category || "BUSINESS",
      subcategory: body.subcategory || "Shops",
      description: body.description || null,
      address: body.address || "",
      area: body.area || user.area,
      city: body.city || user.city,
      phone: body.phone || null,
      email: body.email || null,
      website: body.website || null,
      hours: body.hours || null,
      imageUrl: body.imageUrl || null,
      ownerId: user.id,
    },
  });

  return NextResponse.json(entry);
}
