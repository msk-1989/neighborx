import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/commerce/[id]/order?uid=
 * Body: { qty, note }
 * Creates an order for the given product with total = qty * product.price.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const userId = url.searchParams.get("uid") || "arjun@nx.in";
  const body = await req.json();

  const user = await db.user.findFirst({
    where: { OR: [{ id: userId }, { email: userId }] },
  });
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const product = await db.commerceProduct.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (!product.inStock) {
    return NextResponse.json({ error: "out of stock" }, { status: 400 });
  }

  const qty = Number(body.qty) || 1;
  const order = await db.commerceOrder.create({
    data: {
      productId: id,
      buyerId: user.id,
      qty,
      total: qty * product.price,
      note: body.note || null,
    },
    include: { buyer: true, product: true },
  });
  return NextResponse.json(order);
}
