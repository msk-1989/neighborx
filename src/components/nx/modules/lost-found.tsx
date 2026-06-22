"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { LostFound } from "@/lib/types";
import { timeAgo, inr } from "@/lib/types";
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
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, MapPin, Plus, PawPrint, Smartphone, FileText, Key, Package, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATS = [
  { key: "PET", label: "🐾 Pet", icon: PawPrint },
  { key: "MOBILE", label: "📱 Mobile", icon: Smartphone },
  { key: "DOCUMENT", label: "📄 Document", icon: FileText },
  { key: "VEHICLE", label: "🛵 Vehicle", icon: Package },
  { key: "KEYS", label: "🔑 Keys", icon: Key },
  { key: "OTHER", label: "📦 Other", icon: Package },
];

export function LostFound({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<LostFound[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [type, setType] = React.useState("ALL");
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api<LostFound[]>(`/api/lostfound?type=${type}`));
    } finally {
      setLoading(false);
    }
  }, [type]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {["ALL", "LOST", "FOUND"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "ALL" ? "All" : t === "LOST" ? "Lost" : "Found"}
            </button>
          ))}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Post</Button>
          </DialogTrigger>
          <LFDialog uid={uid} onCreated={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Card key={i} className="h-44 animate-pulse bg-muted/40" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No lost & found posts</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((l) => <LFCard key={l.id} l={l} />)}
        </div>
      )}
    </div>
  );
}

function LFCard({ l }: { l: LostFound }) {
  const cat = CATS.find((c) => c.key === l.category);
  const Icon = cat?.icon || Package;
  return (
    <Card className="p-4 flex gap-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24">
        {l.imageUrl ? (
          <img src={l.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground"><Icon className="h-8 w-8" /></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-sm line-clamp-1">{l.title}</div>
          <Badge variant={l.type === "LOST" ? "destructive" : "secondary"} className="text-[10px] shrink-0">{l.type}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{l.description}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{cat?.label}</Badge>
          <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {l.location}</span>
          <span>· {timeAgo(l.createdAt)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-1.5">
          <div className="flex items-center gap-1.5">
            <UserAvatar user={l.reporter} size="h-5 w-5" />
            <span className="text-[11px] text-muted-foreground">{l.reporter.name}</span>
          </div>
          {l.reward > 0 && (
            <Badge className="gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px]">
              <Gift className="h-3 w-3" /> {inr(l.reward)} reward
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function LFDialog({ uid, onCreated }: { uid: string; onCreated: () => void }) {
  const [form, setForm] = React.useState({
    type: "LOST",
    category: "OTHER",
    title: "",
    description: "",
    location: "",
    reward: "0",
    imageUrl: "",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.title) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      await api(`/api/lostfound?uid=${uid}`, { method: "POST", body: JSON.stringify(form) });
      toast.success("Posted to Lost & Found 🔍");
      onCreated();
    } catch { toast.error("Failed to post"); }
    finally { setSaving(false); }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> Lost or Found something?</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["LOST", "FOUND"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATS.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Description (color, identifying marks, when/where...)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[80px]" />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input placeholder="Reward ₹" type="number" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} />
        </div>
        <Input placeholder="Image URL (optional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5"><Search className="h-4 w-4" />{saving ? "Posting..." : "Post"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
