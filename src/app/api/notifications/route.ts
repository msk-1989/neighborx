import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") || "arjun@nx.in";
  const user = await db.user.findFirst({ where: { OR: [{ id: uid }, { email: uid }] } });
  if (!user) return NextResponse.json([]);
  const notifs = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(notifs);
}
