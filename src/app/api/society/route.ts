import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

/**
 * GET /api/society?uid=
 * Returns the user's society (matched by user.society name) with notices
 * ordered by createdAt desc. If no society exists yet, creates a default
 * "Royal Residency" society (matching the user.society default) so residents
 * always have somewhere to land.
 */
export async function GET(req: Request) {
  const user = await currentUser(req);
  const societyName = user?.society || "Royal Residency";
  const area = user?.area || "Khair Nagar";
  const city = user?.city || "Udgir";

  let society = await db.society.findFirst({
    where: { name: societyName },
    include: {
      notices: { orderBy: { createdAt: "desc" } },
      admin: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  if (!society) {
    society = await db.society.create({
      data: {
        name: societyName,
        address: `${area}, ${city}`,
        area,
        city,
        totalUnits: 48,
        adminId: user?.id,
      },
      include: {
        notices: { orderBy: { createdAt: "desc" } },
        admin: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  return NextResponse.json(society);
}
