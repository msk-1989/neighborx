"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Emergency } from "@/lib/types";
import { timeAgo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Siren, MapPin, Users, Plus, HandHeart, Check, Droplet, Car, Stethoscope, Flame, UserX, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATS = [
  { key: "BLOOD", label: "Blood Required", icon: Droplet, color: "text-red-600 bg-red-500/10" },
  { key: "ACCIDENT", label: "Accident", icon: Car, color: "text-orange-600 bg-orange-500/10" },
  { key: "MEDICAL", label: "Medical", icon: Stethoscope, color: "text-rose-600 bg-rose-500/10" },
  { key: "MISSING_PERSON", label: "Missing Person", icon: UserX, color: "text-amber-600 bg-amber-500/10" },
  { key: "FIRE", label: "Fire", icon: Flame, color: "text-red-600 bg-red-500/10" },
  { key: "WOMEN_SAFETY", label: "Women Safety", icon: ShieldAlert, color: "text-purple-600 bg-purple-500/10" },
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-600 text-white",
  HIGH: "bg-orange-500 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-yellow-400 text-black",
};

export function Emergency({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<Emergency[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api<Emergency[]>("/api/emergency"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const t = setInterval(load, 10000); // realtime-ish
    return () => clearInterval(t);
  }, [load]);

  async function respond(id: string) {
    await api(`/api/emergency?uid=${uid}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "respond", id }),
    });
    toast.success("You responded to help 🙏");
    load();
  }
  async function resolve(id: string) {
    await api(`/api/emergency?uid=${uid}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "resolve", id }),
    });
    toast.success("Marked as resolved");
    load();
  }

  return (
    <div className="space-y-4">
      {/* SOS banner */}
      <Card className="overflow-hidden border-destructive/30">
        <div className="flex flex-col items-center gap-3 bg-destructive/5 p-5 sm:flex-row">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-destructive text-white animate-pulse-ring">
            <Siren className="h-7 w-7" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-lg font-bold">Emergency SOS Network</div>
            <div className="text-sm text-muted-foreground">
              Raise an alert. Verified neighbors nearby get notified instantly.
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-1.5">
                <Plus className="h-4 w-4" /> Raise SOS
              </Button>
            </DialogTrigger>
            <SosDialog uid={uid} onCreated={() => { setOpen(false); load(); }} />
          </Dialog>
        </div>
        {/* quick categories */}
        <div className="grid grid-cols-3 gap-2 border-t p-3 sm:grid-cols-6">
          {CATS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                onClick={() => setOpen(true)}
                className={cn("flex flex-col items-center gap-1 rounded-lg p-2.5 text-center transition-colors hover:bg-accent tap-feedback", c.color)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Card key={i} className="h-32 animate-pulse bg-muted/40" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No active emergencies. Stay safe 🙏</Card>
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <EmergencyCard key={e.id} e={e} onRespond={() => respond(e.id)} onResolve={() => resolve(e.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmergencyCard({ e, onRespond, onResolve }: { e: Emergency; onRespond: () => void; onResolve: () => void }) {
  const cat = CATS.find((c) => c.key === e.category);
  const Icon = cat?.icon || Siren;
  const active = e.status === "ACTIVE";
  return (
    <Card className={cn("p-4", active && "border-destructive/40")}>
      <div className="flex items-start gap-3">
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", cat?.color || "bg-muted")}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="font-semibold">{e.title}</div>
            <div className="flex items-center gap-1.5">
              <Badge className={cn("text-[10px]", SEVERITY_COLORS[e.severity])}>{e.severity}</Badge>
              <Badge variant={active ? "destructive" : "secondary"} className="text-[10px]">
                {active ? "ACTIVE" : "RESOLVED"}
              </Badge>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {e.responders} responding</span>
            <span>· {timeAgo(e.createdAt)}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
            <div className="flex items-center gap-1.5">
              <UserAvatar user={e.reporter} size="h-6 w-6" />
              <span className="text-xs text-muted-foreground">by {e.reporter.name}</span>
            </div>
            {active && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1.5 tap-feedback" onClick={onRespond}>
                  <HandHeart className="h-3.5 w-3.5" /> I can help
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 tap-feedback" onClick={onResolve}>
                  <Check className="h-3.5 w-3.5" /> Mark resolved
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SosDialog({ uid, onCreated }: { uid: string; onCreated: () => void }) {
  const [form, setForm] = React.useState({
    category: "MEDICAL",
    title: "",
    description: "",
    location: "",
    severity: "HIGH",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.title) {
      toast.error("Please add a title");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/emergency?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("SOS broadcast to your neighborhood 🚨");
      onCreated();
    } catch {
      toast.error("Failed to raise SOS");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-destructive">
          <Siren className="h-5 w-5" /> Raise Emergency SOS
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATS.map((c) => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Short title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Describe the emergency in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[90px]" />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="destructive" onClick={submit} disabled={saving} className="gap-1.5">
          <Siren className="h-4 w-4" />
          {saving ? "Broadcasting..." : "Broadcast SOS"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
