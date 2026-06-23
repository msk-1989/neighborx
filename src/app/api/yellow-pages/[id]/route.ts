import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const entry = await db.yellowPageEntry.findUnique({
    where: { id },
    include: { owner: true },
  });
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const existing = await db.yellowPageEntry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  const isAdmin = user.role === "SUPER_ADMIN";
  if (existing.ownerId !== user.id && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const updated = await db.yellowPageEntry.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      category: body.category ?? existing.category,
      subcategory: body.subcategory ?? existing.subcategory,
      description: body.description ?? existing.description,
      address: body.address ?? existing.address,
      phone: body.phone ?? existing.phone,
      email: body.email ?? existing.email,
      website: body.website ?? existing.website,
      hours: body.hours ?? existing.hours,
      imageUrl: body.imageUrl ?? existing.imageUrl,
      verified: body.verified ?? existing.verified,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const existing = await db.yellowPageEntry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  const isAdmin = user.role === "SUPER_ADMIN";
  if (existing.ownerId !== user.id && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await db.yellowPageEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
