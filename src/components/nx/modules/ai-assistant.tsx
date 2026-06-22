"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useNX } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Bot, User as UserIcon, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; text: string }

const SUGGESTIONS = [
  "Best doctor near me for fever?",
  "How do I find a reliable plumber tonight?",
  "How to sell my old phone fast in my area?",
  "What's the safest way to report a streetlight issue?",
  "Best schools within 2km for my kid?",
  "How do I verify my address on NeighborX?",
];

export function AIAssistant() {
  const nb = useNX((s) => s.neighborhood);
  const [msgs, setMsgs] = React.useState<Msg[]>([
    {
      role: "assistant",
      text: `Namaste! 🙏 I'm your NX Assistant. Ask me anything about your neighborhood — ${nb.society}, ${nb.area}, ${nb.city}. I can recommend nearby doctors, schools, restaurants, help you find services, report issues, or guide you on using NeighborX.`,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  async function ask(q?: string) {
    const question = (q ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await api<{ answer: string }>("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ question, neighborhood: nb }),
      });
      setMsgs((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch {
      toast.error("Assistant unavailable");
      setMsgs((m) => [...m, { role: "assistant", text: "Sorry, I couldn't reach the AI service. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="overflow-hidden">
        <div className="brand-gradient p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-lg">NX Assistant</div>
              <div className="text-xs text-white/80">Your AI neighborhood guide · {nb.city}</div>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="max-h-[52dvh] min-h-[300px] space-y-4 overflow-y-auto overscroll-contain scrollbar-thin p-4">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
              <div className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                m.role === "assistant" ? "brand-gradient text-white" : "bg-muted text-foreground"
              )}>
                {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "assistant"
                  ? "bg-muted rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              )}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full brand-gradient text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about doctors, schools, services, civic issues..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
            />
            <Button onClick={() => ask()} disabled={loading || !input.trim()} className="gap-1.5 self-end">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5" /> Try asking
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
