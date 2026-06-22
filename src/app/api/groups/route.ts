import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/groups — list all groups (optionally filtered by ?scope= or ?category=)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");
  const category = searchParams.get("category");

  const groups = await db.group.findMany({
    where: {
      ...(scope ? { scope } : {}),
      ...(category ? { category } : {}),
    },
    include: {
      owner: true,
      members: { include: { user: true } },
    },
    orderBy: { memberCount: "desc" },
  });
  return NextResponse.json(groups);
}

// POST /api/groups — create a new group
export async function POST(req: Request) {
  const body = await req.json();
  const { name, description, category, privacy, scope, ownerId } = body as {
    name: string;
    description: string;
    category: string;
    privacy: string;
    scope: string;
    ownerId: string;
  };

  const owner = await db.user.findUnique({ where: { id: ownerId } });
  if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 404 });

  const group = await db.group.create({
    data: {
      name,
      description,
      category: category || "OTHER",
      privacy: privacy || "PUBLIC",
      scope: scope || "AREA",
      area: owner.area,
      city: owner.city,
      society: owner.society,
      ownerId,
      memberCount: 1,
    },
  });

  // owner is the first member
  await db.groupMember.create({
    data: { groupId: group.id, userId: ownerId, role: "OWNER" },
  });

  return NextResponse.json(group);
}
