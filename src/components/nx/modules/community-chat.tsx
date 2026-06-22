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
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<Socket | null>(null);

  // load history from DB
  React.useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const msgs = await api<ChatMessage[]>(`/api/chat?room=${room}`);
        setMessages(msgs);
      } finally {
        setLoading(false);
      }
    })();
  }, [room]);

  // connect socket
  React.useEffect(() => {
    const socket = io("/?XTransformPort=3003", { query: { roomId: room }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("message", (m: ChatMessage) => {
      setMessages((prev) => [...prev, m]);
    });
    socket.on("presence", (p: { count: number }) => setPresence(p.count));
    return () => { socket.disconnect(); };
  }, [room]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit("message", {
      roomId: room,
      senderId: user.id,
      senderName: user.name,
      text,
    });
    setInput("");
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
            <span className="flex items-center gap-1"><Circle className={cn("h-2 w-2", connected ? "fill-primary text-primary" : "fill-muted-foreground")} /> {connected ? "Live" : "Connecting"}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {presence} online</span>
          </div>
        </div>

        {/* rooms */}
        <div className="flex gap-1.5 overflow-x-auto border-b p-2 scrollbar-thin">
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
        <div ref={scrollRef} className="max-h-[52vh] min-h-[300px] space-y-3 overflow-y-auto scrollbar-thin p-4">
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
                      <AvatarFallback className="text-[10px] bg-primary/15 text-primary">{m.senderName?.split(" ").map((s) => s[0]).slice(0, 2).join("") || "?"}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className={cn("max-w-[75%]", mine && "items-end flex flex-col")}>
                  {showAvatar && (
                    <div className={cn("mb-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground", mine && "flex-row-reverse")}>
                      <span className="font-medium text-foreground">{mine ? "You" : m.senderName}</span>
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
        Real-time neighborhood chat · powered by socket.io · be kind & respectful 🙏
      </div>
    </div>
  );
}
