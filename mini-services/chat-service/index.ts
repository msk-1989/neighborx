/**
 * NeighborX Chat Mini-Service
 * ---------------------------
 * Real-time neighborhood chat via socket.io.
 *
 * - Fixed port: 3003 (hardcoded, no PORT env)
 * - Default socket.io path: "/" (do NOT customize — the Next.js frontend
 *   connects via the gateway with `io("/?XTransformPort=3003")`)
 * - CORS: allow all origins (the Next.js app connects through the gateway)
 * - Health check: GET / -> { ok: true, service: "neighborx-chat" }
 *
 * Connection string (frontend):
 *   io("/?XTransformPort=3003")
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Server, type Socket } from "socket.io";

// --- Configuration ---------------------------------------------------------
const PORT = 3003; // fixed, per task spec — do not read from env

// --- HTTP server (for the health-check endpoint) ---------------------------
const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Health check on GET /
  if (req.method === "GET" && (req.url === "/" || req.url === "")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "neighborx-chat" }));
    return;
  }

  // socket.io handles /socket.io/* ; anything else → 404 JSON
  if (!req.url?.startsWith("/socket.io/")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Not found" }));
    return;
  }
  // Let socket.io handle its own paths (this branch shouldn't normally run
  // because socket.io attaches its own listener, but kept for safety).
});

// --- socket.io server ------------------------------------------------------
const io = new Server(httpServer, {
  // Allow CORS from all origins (the Next.js app connects via the gateway).
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  // Default path is "/socket.io/" — do NOT override.
});

// Track per-room socket counts for presence broadcasts.
const roomCounts = new Map<string, number>();

function bumpRoom(roomId: string, delta: number): number {
  const next = Math.max(0, (roomCounts.get(roomId) ?? 0) + delta);
  if (next <= 0) {
    roomCounts.delete(roomId);
    return 0;
  }
  roomCounts.set(roomId, next);
  return next;
}

function emitPresence(roomId: string): void {
  const count = roomCounts.get(roomId) ?? 0;
  io.to(roomId).emit("presence", { room: roomId, count });
}

// --- Connection handling ---------------------------------------------------
io.on("connection", async (socket: Socket) => {
  // Read roomId from the handshake query (default to "general").
  const rawRoom = socket.handshake.query.roomId;
  const roomId =
    (Array.isArray(rawRoom) ? rawRoom[0] : rawRoom) || "general";

  const safeRoom = String(roomId || "general");

  // Await the join so the socket is reliably in the room's membership before
  // we broadcast presence (otherwise the joining socket can miss its own
  // "count" event due to socket.io's async room join).
  await socket.join(safeRoom);
  bumpRoom(safeRoom, +1);

  console.log(
    `[chat] connect  id=${socket.id} room=${safeRoom} count=${roomCounts.get(safeRoom)}`,
  );

  // Announce presence to the room (including the joiner).
  emitPresence(safeRoom);

  // --- `message` event ----------------------------------------------------
  // Payload: { roomId, senderId, senderName, text }
  // We broadcast (including sender) with an added `id` and `createdAt`.
  socket.on("message", (payload: unknown) => {
    let p: {
      roomId?: unknown;
      senderId?: unknown;
      senderName?: unknown;
      text?: unknown;
    };

    if (typeof payload !== "object" || payload === null) {
      // Malformed payload — ignore.
      return;
    }
    p = payload as {
      roomId?: unknown;
      senderId?: unknown;
      senderName?: unknown;
      text?: unknown;
    };

    const targetRoom =
      (typeof p.roomId === "string" && p.roomId) || safeRoom;

    const message = {
      id: crypto.randomUUID(),
      roomId: targetRoom,
      senderId:
        typeof p.senderId === "string" ? p.senderId : String(p.senderId ?? ""),
      senderName:
        typeof p.senderName === "string"
          ? p.senderName
          : String(p.senderName ?? ""),
      text: typeof p.text === "string" ? p.text : String(p.text ?? ""),
      createdAt: new Date().toISOString(),
    };

    // Broadcast to everyone in the room, INCLUDING the sender.
    io.to(targetRoom).emit("message", message);

    console.log(
      `[chat] message  room=${targetRoom} from=${message.senderName}(${message.senderId}) id=${message.id}`,
    );
  });

  // --- Disconnect / leave --------------------------------------------------
  socket.on("disconnect", () => {
    bumpRoom(safeRoom, -1);
    console.log(
      `[chat] disconnect id=${socket.id} room=${safeRoom} count=${roomCounts.get(safeRoom) ?? 0}`,
    );
    emitPresence(safeRoom);
  });
});

// --- Start listening -------------------------------------------------------
httpServer.listen(PORT, () => {
  console.log(`neighborx-chat listening on http://0.0.0.0:${PORT}`);
  console.log(`  health:   GET http://localhost:${PORT}/`);
  console.log(`  socket.io: ws://localhost:${PORT}/socket.io/ (path default)`);
  console.log(`  frontend connect string: io("/?XTransformPort=${PORT}")`);
});

// --- Graceful shutdown -----------------------------------------------------
function shutdown(signal: string): void {
  console.log(`[chat] received ${signal}, shutting down…`);
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
