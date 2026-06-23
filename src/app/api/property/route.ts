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
  const propertyType = url.searchParams.get("propertyType");
  const q = url.searchParams.get("q");
  const listings = await db.propertyListing.findMany({
    where: {
      AND: [
        type && type !== "ALL" ? { type } : {},
        propertyType && propertyType !== "ALL" ? { propertyType } : {},
        q
          ? {
              OR: [
                { title: { contains: q } },
                { address: { contains: q } },
                { location: { contains: q } },
              ],
            }
          : {},
        { status: "AVAILABLE" },
      ],
    },
    include: { owner: true },
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const prop = await db.propertyListing.create({
    data: {
      title: body.title,
      description: body.description,
      type: body.type || "RENT",
      propertyType: body.propertyType || "2BHK",
      price: Number(body.price) || 0,
      rent: Number(body.rent) || 0,
      deposit: Number(body.deposit) || 0,
      area: body.area || "Sq.ft",
      furnishing: body.furnishing || "SEMI",
      address: body.address || "",
      imageUrl: body.imageUrl || null,
      bedrooms: Number(body.bedrooms) || 2,
      bathrooms: Number(body.bathrooms) || 1,
      amenities: body.amenities || null,
      location: body.location || `${user.area}, ${user.city}`,
      ownerId: user.id,
    },
    include: { owner: true },
  });
  return NextResponse.json(prop);
}
