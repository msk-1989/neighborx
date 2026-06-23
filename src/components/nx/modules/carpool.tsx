"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { CarpoolRide } from "@/lib/types";
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
  Car,
  Search,
  Plus,
  MessageCircle,
  Sparkles,
  Users,
  Calendar,
  Clock,
  IndianRupee,
  Repeat,
  Navigation,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const TYPE_OPTIONS = [
  { key: "ALL", label: "All rides" },
  { key: "OFFER", label: "🚗 Offering" },
  { key: "REQUEST", label: "🙏 Need a ride" },
];

const RECURRING_OPTIONS = ["One-time", "Mon-Fri", "Daily", "Weekends"];

export function Carpool({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<CarpoolRide[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [type, setType] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const openChat = useNX((s) => s.openChat);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<CarpoolRide[]>(
        `/api/carpool?type=${type}&q=${encodeURIComponent(q)}`
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [type, q]);

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
            placeholder="Search routes, locations..."
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Post ride
            </Button>
          </DialogTrigger>
          <CarpoolDialog
            uid={uid}
            onCreated={() => {
              setOpen(false);
              load();
            }}
          />
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-medium transition-colors tap-feedback",
              type === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
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
          No rides found. Be the first to offer or request a ride!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <CarpoolCard
              key={it.id}
              item={it}
              onChat={() => openChat(`carpool-${it.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CarpoolCard({
  item,
  onChat,
}: {
  item: CarpoolRide;
  onChat: () => void;
}) {
  const isOffer = item.type === "OFFER";
  const seatsLeft = Math.max(0, item.seats - item.seatsFilled);
  const isFull = item.type === "OFFER" && seatsLeft === 0;
  return (
    <Card className="overflow-hidden flex flex-col group">
      <div className="relative h-24 bg-gradient-to-br from-sky-500/15 via-emerald-500/10 to-amber-500/10 grid place-items-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-background/80 backdrop-blur shadow-sm">
          {isOffer ? (
            <Car className="h-6 w-6 text-primary" />
          ) : (
            <Navigation className="h-6 w-6 text-amber-600" />
          )}
        </div>
        <Badge
          className={cn(
            "absolute left-2 top-2 gap-1 text-white",
            isOffer ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-600 hover:bg-amber-600"
          )}
        >
          {isOffer ? "🚗 Offering" : "🙏 Needs a ride"}
        </Badge>
        {isFull && (
          <Badge variant="secondary" className="absolute right-2 top-2 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            FULL
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <span className="line-clamp-1">{item.fromLocation}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="line-clamp-1">{item.toLocation}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {item.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {item.time}
          </span>
          {item.type === "OFFER" && (
            <span
              className={cn(
                "flex items-center gap-1 font-medium",
                seatsLeft === 0 ? "text-rose-600" : "text-emerald-600"
              )}
            >
              <Users className="h-3 w-3" />
              {seatsLeft}/{item.seats} seats left
            </span>
          )}
          {item.recurring !== "One-time" && (
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3" /> {item.recurring}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <IndianRupee className="h-3 w-3" />
            {item.contribution > 0 ? inr(item.contribution) : "Free"}
          </span>
          <span className="text-muted-foreground">fuel share</span>
        </div>

        {item.notes && (
          <div className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
            {item.notes}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-1.5">
            <UserAvatar user={item.driver} size="h-6 w-6" />
            <span className="text-xs text-muted-foreground">
              {item.driver.name.split(" ")[0]}
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

function CarpoolDialog({
  uid,
  onCreated,
}: {
  uid: string;
  onCreated: () => void;
}) {
  const [form, setForm] = React.useState({
    type: "OFFER",
    fromLocation: "",
    toLocation: "",
    date: "",
    time: "",
    seats: "1",
    recurring: "One-time",
    contribution: "",
    notes: "",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.fromLocation || !form.toLocation || !form.date || !form.time) {
      toast.error("From, To, Date and Time are required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/carpool?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success(
        form.type === "OFFER" ? "Ride offered! 🚗" : "Ride request posted! 🙏"
      );
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
          <Car className="h-5 w-5 text-primary" /> Post a ride
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Select
          value={form.type}
          onValueChange={(v) => setForm({ ...form, type: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OFFER">🚗 I'm offering a ride</SelectItem>
            <SelectItem value="REQUEST">🙏 I need a ride</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="From *"
            value={form.fromLocation}
            onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}
          />
          <Input
            placeholder="To *"
            value={form.toLocation}
            onChange={(e) => setForm({ ...form, toLocation: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Date *"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            placeholder="Time *"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={form.recurring}
            onValueChange={(v) => setForm({ ...form, recurring: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRING_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.type === "OFFER" ? (
            <Input
              placeholder="Seats available"
              type="number"
              min={1}
              value={form.seats}
              onChange={(e) => setForm({ ...form, seats: e.target.value })}
            />
          ) : (
            <Input
              placeholder="Contribution ₹ (0 = free)"
              type="number"
              value={form.contribution}
              onChange={(e) =>
                setForm({ ...form, contribution: e.target.value })
              }
            />
          )}
        </div>
        {form.type === "OFFER" && (
          <Input
            placeholder="Fuel share contribution ₹ (0 = free)"
            type="number"
            value={form.contribution}
            onChange={(e) =>
              setForm({ ...form, contribution: e.target.value })
            }
          />
        )}
        <Textarea
          placeholder="Notes — pickup details, route, who's welcome..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {saving ? "Posting..." : "Post ride"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
