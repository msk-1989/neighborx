"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { WatchAlert } from "@/lib/types";
import { timeAgo } from "@/lib/types";
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
  Shield,
  ShieldAlert,
  MapPin,
  ThumbsUp,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const FILTERS: { key: string; label: string; emoji: string }[] = [
  { key: "ALL", label: "All", emoji: "📋" },
  { key: "SCAM", label: "Scam", emoji: "⚠️" },
  { key: "CRIME", label: "Crime", emoji: "🚨" },
  { key: "SUSPICIOUS", label: "Suspicious", emoji: "👁️" },
  { key: "SAFETY_TIP", label: "Safety Tip", emoji: "💡" },
];

const TYPE_EMOJI: Record<string, string> = {
  SCAM: "⚠️",
  CRIME: "🚨",
  SUSPICIOUS: "👁️",
  SAFETY_TIP: "💡",
  MISSING_PERSON: "🔍",
  MISSING_PET: "🐾",
};

const SEVERITY_BAR: Record<string, string> = {
  CRITICAL: "bg-destructive",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-slate-400",
};

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: "bg-destructive/15 text-destructive border-destructive/30",
  HIGH: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  LOW: "bg-slate-400/15 text-slate-500 border-slate-400/30",
};

const TYPE_LABEL: Record<string, string> = {
  SCAM: "Scam",
  CRIME: "Crime",
  SUSPICIOUS: "Suspicious",
  SAFETY_TIP: "Safety Tip",
  MISSING_PERSON: "Missing Person",
  MISSING_PET: "Missing Pet",
};

export function NeighborhoodWatch({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<WatchAlert[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("ALL");
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<WatchAlert[]>(
        `/api/watch${filter !== "ALL" ? `?type=${filter}` : ""}`
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="brand-gradient relative overflow-hidden rounded-2xl p-5 text-white sm:p-6">
        <div className="absolute -right-6 -top-6 opacity-15">
          <ShieldAlert className="h-32 w-32" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h2 className="text-xl font-bold">Neighborhood Watch</h2>
          </div>
          <p className="mt-1 max-w-md text-sm text-white/85">
            Stay alert. Stay safe. Look out for each other.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="mt-4 gap-1.5 tap-feedback"
                size="sm"
              >
                <Plus className="h-4 w-4" /> Report Alert
              </Button>
            </DialogTrigger>
            <ReportDialog
              uid={uid}
              onCreated={() => {
                setOpen(false);
                load();
              }}
            />
          </Dialog>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors tap-feedback",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <div className="text-3xl mb-2">🛡️</div>
          No alerts reported in this category. Your neighborhood looks quiet.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <WatchCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function WatchCard({ a }: { a: WatchAlert }) {
  const [helpful, setHelpful] = React.useState(a.helpfulCount);
  const [marked, setMarked] = React.useState(false);

  function markHelpful() {
    if (marked) {
      setHelpful((n) => n - 1);
      setMarked(false);
      toast("Removed your helpful mark");
    } else {
      setHelpful((n) => n + 1);
      setMarked(true);
      toast.success("Marked as helpful 👍");
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div
          className={cn(
            "w-1.5 shrink-0",
            SEVERITY_BAR[a.severity] || "bg-slate-400"
          )}
        />
        <div className="flex-1 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-[10px]">
                <span>{TYPE_EMOJI[a.type] || "📋"}</span>
                {TYPE_LABEL[a.type] || a.type}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase",
                  SEVERITY_BADGE[a.severity] || SEVERITY_BADGE.LOW
                )}
              >
                {a.severity}
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {timeAgo(a.createdAt)}
            </span>
          </div>

          <h3 className="mt-2 flex items-center gap-1.5 font-semibold leading-tight">
            {a.severity === "CRITICAL" && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            {a.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {a.description}
          </p>

          {a.location && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {a.location}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <UserAvatar user={a.reporter} size="h-6 w-6" />
              <span className="truncate text-xs text-muted-foreground">
                by {a.reporter.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" /> {helpful}
              </span>
              <Button
                size="sm"
                variant={marked ? "default" : "outline"}
                onClick={markHelpful}
                className="gap-1.5 tap-feedback"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Helpful
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReportDialog({
  uid,
  onCreated,
}: {
  uid: string;
  onCreated: () => void;
}) {
  const [form, setForm] = React.useState({
    type: "SUSPICIOUS",
    title: "",
    description: "",
    location: "",
    severity: "MEDIUM",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/watch?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({ ...form, reporterId: uid }),
      });
      toast.success("Alert reported 🛡️");
      setForm({
        type: "SUSPICIOUS",
        title: "",
        description: "",
        location: "",
        severity: "MEDIUM",
      });
      onCreated();
    } catch {
      toast.error("Failed to report alert");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Report a Watch Alert</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SCAM">⚠️ Scam</SelectItem>
              <SelectItem value="CRIME">🚨 Crime</SelectItem>
              <SelectItem value="SUSPICIOUS">👁️ Suspicious</SelectItem>
              <SelectItem value="SAFETY_TIP">💡 Safety Tip</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={form.severity}
            onValueChange={(v) => setForm({ ...form, severity: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">🟢 Low</SelectItem>
              <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
              <SelectItem value="HIGH">🟠 High</SelectItem>
              <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Describe what happened…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          placeholder="Location (e.g. near Sai Mandir, Udgir)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <ShieldAlert className="h-4 w-4" />
          {saving ? "Reporting..." : "Submit Alert"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
