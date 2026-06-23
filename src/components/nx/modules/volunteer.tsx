"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { VolunteerOpportunity } from "@/lib/types";
import { timeAgo } from "@/lib/types";
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
  HeartHandshake,
  Search,
  Plus,
  MapPin,
  CalendarClock,
  Phone,
  Users,
  Sparkles,
  Droplet,
  Siren,
  Heart,
  BookOpen,
  Leaf,
  PawPrint,
  Package,
  HandHeart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATEGORIES = [
  { key: "ALL", label: "All", icon: HeartHandshake },
  { key: "BLOOD_DONOR", label: "🩸 Blood Donor", icon: Droplet },
  { key: "DISASTER", label: "🆘 Disaster", icon: Siren },
  { key: "ELDERLY", label: "👴 Elderly", icon: Heart },
  { key: "TEACHING", label: "📚 Teaching", icon: BookOpen },
  { key: "ENVIRONMENT", label: "🌱 Environment", icon: Leaf },
  { key: "ANIMALS", label: "🐾 Animals", icon: PawPrint },
  { key: "OTHER", label: "📦 Other", icon: Package },
];

const URGENCY_COLORS: Record<string, string> = {
  LOW: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  HIGH: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  CRITICAL: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const c = CATEGORIES.find((x) => x.key === type);
  const Icon = c?.icon ?? Package;
  return <Icon className={className} />;
}

export function Volunteer({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const openChat = useNX((s) => s.openChat);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<VolunteerOpportunity[]>(
        `/api/volunteer?type=${cat}&q=${encodeURIComponent(q)}`
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [cat, q]);

  React.useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function signup(opp: VolunteerOpportunity) {
    try {
      await api(`/api/volunteer/${opp.id}/signup?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      toast.success("You're signed up! 🙌");
      load();
    } catch (err) {
      const msg = (err as Error).message || "";
      if (msg.includes("409")) toast.error("Already signed up");
      else toast.error("Sign up failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search volunteer opportunities..."
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Post Opportunity
            </Button>
          </DialogTrigger>
          <CreateDialog
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
          No volunteer opportunities here yet. Be the first to rally the neighborhood!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((o) => (
            <OppCard
              key={o.id}
              opp={o}
              uid={uid}
              onSignup={() => signup(o)}
              onChat={() => openChat(`volunteer-${o.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OppCard({
  opp,
  uid,
  onSignup,
  onChat,
}: {
  opp: VolunteerOpportunity;
  uid: string;
  onSignup: () => void;
  onChat: () => void;
}) {
  const filled = Math.min(opp.filled, opp.slots);
  const pct = opp.slots > 0 ? Math.round((filled / opp.slots) * 100) : 0;
  const isFull = filled >= opp.slots;
  const alreadySignedUp = (opp.signups || []).some((s) => s.userId === uid);

  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <TypeIcon type={opp.type} className="h-4 w-4" />
          </div>
          <Badge variant="outline" className="text-[10px] capitalize">
            {opp.type.replace(/_/g, " ").toLowerCase()}
          </Badge>
        </div>
        <Badge
          variant="outline"
          className={cn("border text-[10px] font-semibold", URGENCY_COLORS[opp.urgency])}
        >
          {opp.urgency}
        </Badge>
      </div>

      <div className="mt-2 text-sm font-semibold leading-tight line-clamp-2">{opp.title}</div>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{opp.description}</p>

      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{opp.location}</span>
        </div>
        {opp.date && (
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3 shrink-0" />
            <span className="truncate">{opp.date}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Phone className="h-3 w-3 shrink-0" />
          <span className="truncate">{opp.contactInfo}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" /> {filled}/{opp.slots} signed up
          </span>
          <span className="font-medium text-muted-foreground">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isFull ? "bg-primary" : "bg-primary/60"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-2.5">
        <div className="flex items-center gap-1.5">
          <UserAvatar user={opp.organizer} size="h-6 w-6" />
          <span className="text-xs text-muted-foreground">
            {opp.organizer.name.split(" ")[0]} · {timeAgo(opp.createdAt)}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={onChat}>
            <HandHeart className="h-3.5 w-3.5" /> Chat
          </Button>
          <Button
            size="sm"
            className="h-7 gap-1"
            disabled={isFull || alreadySignedUp}
            onClick={onSignup}
          >
            {alreadySignedUp ? (
              "Signed Up ✓"
            ) : isFull ? (
              "Filled"
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Sign Up
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CreateDialog({ uid, onCreated }: { uid: string; onCreated: () => void }) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    type: "OTHER",
    urgency: "MEDIUM",
    location: "",
    date: "",
    contactInfo: "",
    slots: "1",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.title || !form.description) {
      toast.error("Title and description required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/volunteer?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Opportunity posted! 🙌");
      onCreated();
    } catch {
      toast.error("Failed to post opportunity");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Post a volunteer opportunity</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Input
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Description * — what help is needed?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Input
            placeholder="Slots"
            type="number"
            min={1}
            value={form.slots}
            onChange={(e) => setForm({ ...form, slots: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Date / time (optional)"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            placeholder="Contact info (phone / email)"
            value={form.contactInfo}
            onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {saving ? "Posting..." : "Post Opportunity"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
