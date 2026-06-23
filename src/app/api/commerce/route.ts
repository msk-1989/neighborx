import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

/**
 * GET /api/commerce?category=&q=
 * Returns in-stock products, filterable by category and search query.
 * Includes the seller relation for the storefront card.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cat = url.searchParams.get("category");
  const q = url.searchParams.get("q");

  const products = await db.commerceProduct.findMany({
    where: {
      AND: [
        cat && cat !== "ALL" ? { category: cat } : {},
        q ? { title: { contains: q } } : {},
        { inStock: true },
      ],
    },
    include: { seller: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

/**
 * POST /api/commerce?uid=
 * Body: { title, description, category, price, storeName, deliveryTime, imageUrl }
 * Creates a new product with the current user as seller.
 */
export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const product = await db.commerceProduct.create({
    data: {
      title: String(body.title || "").trim(),
      description: body.description || "",
      category: body.category || "GROCERY",
      price: Number(body.price) || 0,
      imageUrl: body.imageUrl || null,
      storeName: body.storeName || "NeighborX Store",
      deliveryTime: body.deliveryTime || "Same day",
      location: `${user.area}, ${user.city}`,
      sellerId: user.id,
      inStock: body.inStock !== false,
    },
    include: { seller: true },
  });
  return NextResponse.json(product);
}
