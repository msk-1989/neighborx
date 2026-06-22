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

/**
 * POST /api/chat — persist a message to the DB.
 *
 * On the local sandbox, realtime delivery is handled by the socket.io
 * mini-service (port 3003) and the client emits via socket too. On Vercel
 * (no persistent WebSocket service), this endpoint is the *primary* delivery
 * path: the client POSTs here and other clients pick the message up via the
 * polling fallback in community-chat.tsx.
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { roomId, senderId, senderName, text } = body as {
    roomId?: string;
    senderId?: string;
    senderName?: string;
    text?: string;
  };

  if (!senderId || !text || typeof text !== "string") {
    return NextResponse.json({ error: "senderId and text required" }, { status: 400 });
  }

  // Resolve sender so we can return a full ChatMessage shape (with sender).
  const sender = await db.user.findFirst({ where: { id: senderId } });
  if (!sender) {
    return NextResponse.json({ error: "unknown sender" }, { status: 404 });
  }

  const msg = await db.chatMessage.create({
    data: {
      roomId: roomId || "general",
      senderId: sender.id,
      text: text.slice(0, 2000),
    },
    include: { sender: true },
  });

  return NextResponse.json(msg, { status: 201 });
}
