"use client";

import * as React from "react";
import { useState } from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "@/lib/api";
import type { ChatMessage, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessagesSquare, Send, Hash, Users, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const ROOMS = [
  { id: "general", label: "general", desc: "Whole neighborhood" },
  { id: "royal-residency", label: "royal-residency", desc: "Royal Residency society" },
  { id: "marketplace", label: "marketplace", desc: "Buy & sell chatter" },
  { id: "safety", label: "safety", desc: "Neighborhood watch" },
];

export function CommunityChat({ user }: { user: User }) {
  const [room, setRoom] = React.useState("general");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [presence, setPresence] = React.useState(0);
  const [connected, setConnected] = React.useState(false);
  const [demoMode, setDemoMode] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const seenIds = React.useRef<Set<string>>(new Set());

  // load history from DB
  React.useEffect(() => {
    setLoading(true);
    seenIds.current = new Set();
    (async () => {
      try {
        const msgs = await api<ChatMessage[]>(`/api/chat?room=${room}`);
        for (const m of msgs) seenIds.current.add(m.id);
        setMessages(msgs);
      } finally {
        setLoading(false);
      }
    })();
  }, [room]);

  // connect socket (with graceful degradation — falls back to HTTP polling)
  React.useEffect(() => {
    let demoTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    // Connect to the socket.io chat service.
    // - Local sandbox (gateway): NEXT_PUBLIC_CHAT_SERVICE_URL is unset, so we
    //   use the relative "/" path with XTransformPort=3003 — the Caddy gateway
    //   forwards it to the mini-service on port 3003.
    // - Vercel/external: set NEXT_PUBLIC_CHAT_SERVICE_URL to the hosted chat
    //   service URL (e.g. https://neighborx-chat.onrender.com) and we connect
    //   to it directly (cross-origin).
    const chatServiceUrl = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL;
    const socket = io(chatServiceUrl ?? "/?XTransformPort=3003", {
      query: { roomId: room },
      transports: ["websocket", "polling"],
      timeout: 4000,
      reconnectionAttempts: 2,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setDemoMode(false);
      if (demoTimer) clearTimeout(demoTimer);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("message", (m: ChatMessage) => {
      if (seenIds.current.has(m.id)) return;
      seenIds.current.add(m.id);
      setMessages((prev) => [...prev, m]);
    });
    socket.on("presence", (p: { count: number }) => setPresence(p.count));

    // If the socket can't connect within 4s (e.g. on Vercel where the
    // socket.io mini-service isn't running), switch to demo/polling mode so
    // the chat still works over HTTP.
    demoTimer = setTimeout(() => {
      if (!socket.connected) {
        setDemoMode(true);
        setConnected(false);
        // Poll the history endpoint every 4s and merge any new messages.
        pollTimer = setInterval(async () => {
          try {
            const msgs = await api<ChatMessage[]>(`/api/chat?room=${room}`);
            const fresh = msgs.filter((m) => !seenIds.current.has(m.id));
            if (fresh.length > 0) {
              for (const m of fresh) seenIds.current.add(m.id);
              setMessages((prev) => [...prev, ...fresh]);
            }
          } catch {
            /* ignore transient poll errors */
          }
        }, 4000);
      }
    }, 4000);

    return () => {
      if (demoTimer) clearTimeout(demoTimer);
      if (pollTimer) clearInterval(pollTimer);
      socket.disconnect();
    };
  }, [room]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    // Always persist via HTTP (works everywhere). On the local sandbox we
    // ALSO emit via socket for instant broadcast.
    try {
      const saved = await api<ChatMessage>("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          roomId: room,
          senderId: user.id,
          senderName: user.name,
          text,
        }),
      });
      if (!seenIds.current.has(saved.id)) {
        seenIds.current.add(saved.id);
        setMessages((prev) => [...prev, saved]);
      }
    } catch {
      // network error — re-populate the input so the user doesn't lose text
      setInput(text);
      return;
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit("message", {
        roomId: room,
        senderId: user.id,
        senderName: user.name,
        text,
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full brand-gradient text-white"><MessagesSquare className="h-4 w-4" /></div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold"><Hash className="h-3.5 w-3.5 text-muted-foreground" />{room}</div>
              <div className="text-[11px] text-muted-foreground">{ROOMS.find((r) => r.id === room)?.desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Circle className={cn("h-2 w-2", connected ? "fill-primary text-primary" : "fill-muted-foreground")} /> {connected ? "Live" : demoMode ? "Saved (demo)" : "Connecting"}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {presence} online</span>
          </div>
        </div>

        {/* rooms */}
        <div className="flex gap-1.5 overflow-x-auto border-b p-2 no-scrollbar">
          {ROOMS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoom(r.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                room === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              #{r.label}
            </button>
          ))}
        </div>

        {/* messages */}
        <div ref={scrollRef} className="max-h-[52dvh] min-h-[300px] space-y-3 overflow-y-auto overscroll-contain scrollbar-thin p-4">
          {messages.length === 0 && !loading && (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <MessagesSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2">No messages yet. Say hello to your neighbors!</p>
              </div>
            </div>
          )}
          {messages.map((m, i) => {
            const mine = m.senderId === user.id;
            const showAvatar = i === 0 || messages[i - 1].senderId !== m.senderId;
            return (
              <div key={m.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
                <div className="w-8 shrink-0">
                  {showAvatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.sender?.avatar || undefined} />
                      <AvatarFallback className="text-[10px] bg-primary/15 text-primary">{(m.senderName || m.sender?.name || "?").split(" ").map((s) => s[0]).slice(0, 2).join("") || "?"}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className={cn("max-w-[75%]", mine && "items-end flex flex-col")}>
                  {showAvatar && (
                    <div className={cn("mb-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground", mine && "flex-row-reverse")}>
                      <span className="font-medium text-foreground">{mine ? "You" : (m.senderName || m.sender?.name || "Neighbor")}</span>
                    </div>
                  )}
                  <div className={cn(
                    "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    mine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                  )}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* composer */}
        <div className="flex gap-2 border-t p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message #${room}...`}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          />
          <Button onClick={send} disabled={!input.trim()} className="gap-1.5">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      <div className="mt-2 text-center text-[11px] text-muted-foreground">
        {demoMode
          ? "Demo mode · messages are saved but live broadcast needs the chat service (local sandbox)."
          : "Real-time neighborhood chat · powered by socket.io · be kind & respectful 🙏"}
      </div>
    </div>
  );
}
