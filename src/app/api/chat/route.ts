import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const room = url.searchParams.get("room") || "general";
  const msgs = await db.chatMessage.findMany({
    where: { roomId: room },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json(msgs);
}
