"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Listing } from "@/lib/types";
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
  ShoppingBag,
  Search,
  Plus,
  Zap,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "ELECTRONICS", label: "📱 Electronics" },
  { key: "FURNITURE", label: "🪑 Furniture" },
  { key: "VEHICLES", label: "🛵 Vehicles" },
  { key: "FASHION", label: "👕 Fashion" },
  { key: "BOOKS", label: "📚 Books" },
  { key: "APPLIANCES", label: "🔌 Appliances" },
];

export function Marketplace({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const openChat = useNX((s) => s.openChat);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Listing[]>(
        `/api/marketplace?category=${cat}&q=${encodeURIComponent(q)}`
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search listings..."
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Sell
            </Button>
          </DialogTrigger>
          <SellDialog uid={uid} onCreated={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
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
            <Card key={i} className="h-72 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No listings found. Be the first to sell something!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <ListingCard key={l.id} l={l} onChat={() => openChat(`listing-${l.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ l, onChat }: { l: Listing; onChat: () => void }) {
  return (
    <Card className="overflow-hidden flex flex-col group">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {l.imageUrl ? (
          <img
            src={l.imageUrl}
            alt={l.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
        {l.boosted && (
          <Badge className="absolute left-2 top-2 gap-1 bg-amber-500 text-white hover:bg-amber-500">
            <Zap className="h-3 w-3" /> Boosted
          </Badge>
        )}
        <Badge variant="secondary" className="absolute right-2 top-2">
          {l.condition}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="text-base font-bold text-primary">{inr(l.price)}</div>
        <div className="mt-0.5 line-clamp-1 text-sm font-medium">{l.title}</div>
        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {l.description}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {l.location}
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-1.5">
            <UserAvatar user={l.seller} size="h-6 w-6" />
            <span className="text-xs text-muted-foreground">{l.seller.name.split(" ")[0]}</span>
            <span className="text-[10px] text-muted-foreground">· {timeAgo(l.createdAt)}</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={onChat}>
            <MessageCircle className="h-3.5 w-3.5" /> Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SellDialog({ uid, onCreated }: { uid: string; onCreated: () => void }) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    price: "",
    category: "ELECTRONICS",
    condition: "Used",
    imageUrl: "",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.title || !form.price) {
      toast.error("Title and price required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/marketplace?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Listing posted! 🛍️");
      onCreated();
    } catch {
      toast.error("Failed to post listing");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Sell an item</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Input
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Price ₹ *"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["New", "Like New", "Used", "Refurbished"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {saving ? "Posting..." : "Post Listing"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
