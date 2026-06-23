"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { SkillListing } from "@/lib/types";
import { inr, timeAgo } from "@/lib/types";
import { useNX } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Search,
  Plus,
  MapPin,
  MessageCircle,
  Sparkles,
  CalendarClock,
  IndianRupee,
  Video,
  Users,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "LANGUAGE", label: "🗣️ Language" },
  { key: "ACADEMIC", label: "📚 Academic" },
  { key: "COMPUTER", label: "💻 Computer" },
  { key: "MUSIC", label: "🎵 Music" },
  { key: "ART", label: "🎨 Art" },
  { key: "PROFESSIONAL", label: "💼 Professional" },
  { key: "OTHER", label: "📦 Other" },
];

const MODE_OPTIONS = [
  { key: "ALL", label: "All modes" },
  { key: "OFFLINE", label: "👥 In-person" },
  { key: "ONLINE", label: "💻 Online" },
  { key: "BOTH", label: "🔄 Both" },
];

function ModeIcon({ mode }: { mode: string }) {
  if (mode === "ONLINE") return <Wifi className="h-3 w-3" />;
  if (mode === "OFFLINE") return <Users className="h-3 w-3" />;
  return <Video className="h-3 w-3" />;
}

function modeLabel(mode: string) {
  return MODE_OPTIONS.find((m) => m.key === mode)?.label ?? mode;
}

function levelColor(level: string) {
  if (level === "BEGINNER") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  if (level === "INTERMEDIATE") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
}

export function Skills({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<SkillListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [mode, setMode] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const openChat = useNX((s) => s.openChat);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<SkillListing[]>(
        `/api/skills?category=${cat}&mode=${mode}&q=${encodeURIComponent(q)}`
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [cat, mode, q]);

  React.useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search skills & classes..."
            className="pl-9"
          />
        </div>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODE_OPTIONS.map((m) => (
              <SelectItem key={m.key} value={m.key}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Teach
            </Button>
          </DialogTrigger>
          <SkillDialog
            uid={uid}
            onCreated={() => {
              setOpen(false);
              load();
            }}
          />
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-medium transition-colors tap-feedback",
              cat === c.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No skill listings found. Be the first to teach or offer a skill swap!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <SkillCard
              key={it.id}
              item={it}
              onChat={() => openChat(`skills-${it.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SkillCard({
  item,
  onChat,
}: {
  item: SkillListing;
  onChat: () => void;
}) {
  return (
    <Card className="overflow-hidden flex flex-col group">
      <div className="relative h-28 bg-gradient-to-br from-emerald-500/15 via-amber-500/10 to-rose-500/10 grid place-items-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-background/80 backdrop-blur shadow-sm">
          <GraduationCap className="h-7 w-7 text-primary" />
        </div>
        <Badge variant="secondary" className="absolute right-2 top-2 gap-1">
          <ModeIcon mode={item.mode} /> {modeLabel(item.mode)}
        </Badge>
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            levelColor(item.level)
          )}
        >
          {item.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <Badge variant="outline" className="w-fit text-[10px]">
          {CATEGORIES.find((c) => c.key === item.category)?.label ?? item.category}
        </Badge>
        <div className="mt-1.5 line-clamp-1 text-sm font-semibold">{item.title}</div>
        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <IndianRupee className="h-3 w-3" />
            {item.rate > 0 ? `${item.rate}/hr` : "Free / Swap"}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <CalendarClock className="h-3 w-3" /> {item.availability}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {item.location}
        </div>

        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-1.5">
            <UserAvatar user={item.teacher} size="h-6 w-6" />
            <span className="text-xs text-muted-foreground">
              {item.teacher.name.split(" ")[0]}
            </span>
            <span className="text-[10px] text-muted-foreground">
              · {timeAgo(item.createdAt)}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1"
            onClick={onChat}
          >
            <MessageCircle className="h-3.5 w-3.5" /> Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SkillDialog({
  uid,
  onCreated,
}: {
  uid: string;
  onCreated: () => void;
}) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    category: "OTHER",
    mode: "BOTH",
    level: "BEGINNER",
    rate: "",
    availability: "Weekends",
    location: "",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/skills?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Skill listing posted! 🎓");
      onCreated();
    } catch {
      toast.error("Failed to post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" /> Offer a skill
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Input
          placeholder="Title * (e.g. Spoken English classes, Guitar lessons)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Description — what you teach, experience, curriculum..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.mode}
            onValueChange={(v) => setForm({ ...form, mode: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BOTH">🔄 Both</SelectItem>
              <SelectItem value="OFFLINE">👥 In-person</SelectItem>
              <SelectItem value="ONLINE">💻 Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={form.level}
            onValueChange={(v) => setForm({ ...form, level: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Rate ₹/hr (0 = free / skill-swap)"
            type="number"
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Input
            placeholder="Availability (e.g. Weekends, Evenings)"
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
          />
          <Input
            placeholder="Location (optional — defaults to your area)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {saving ? "Posting..." : "Post listing"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
