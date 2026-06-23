import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q");
  const fundraisers = await db.fundraiser.findMany({
    where: {
      AND: [
        category && category !== "ALL" ? { category } : {},
        q ? { title: { contains: q } } : {},
        { status: "ACTIVE" },
      ],
    },
    include: { organizer: true, donations: { include: { donor: true } } },
    orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(fundraisers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const fr = await db.fundraiser.create({
    data: {
      title: body.title,
      description: body.description,
      story: body.story || body.description,
      category: body.category || "COMMUNITY",
      goal: Number(body.goal) || 10000,
      imageUrl: body.imageUrl || null,
      beneficiaryName: body.beneficiaryName || user.name,
      endDate: body.endDate || "",
      organizerId: user.id,
    },
    include: { organizer: true, donations: { include: { donor: true } } },
  });
  return NextResponse.json(fr);
}
