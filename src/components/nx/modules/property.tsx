"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { PropertyListing } from "@/lib/types";
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
  Home,
  Search,
  Plus,
  MapPin,
  Bed,
  Bath,
  Maximize,
  MessageCircle,
  Sparkles,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const TYPES = [
  { key: "ALL", label: "All" },
  { key: "SELL", label: "🏷️ Sell" },
  { key: "RENT", label: "🏠 Rent" },
  { key: "PG", label: "🛏️ PG" },
  { key: "HOSTEL", label: "🏢 Hostel" },
  { key: "COMMERCIAL", label: "🏬 Commercial" },
];

const PROPERTY_TYPES = ["1BHK", "2BHK", "3BHK", "4BHK", "PLOT", "SHOP", "OFFICE", "VILLA"];
const FURNISHING = [
  { key: "FURNISHED", label: "Furnished" },
  { key: "SEMI", label: "Semi" },
  { key: "UNFURNISHED", label: "Unfurnished" },
];

const TYPE_BADGE: Record<string, string> = {
  SELL: "bg-emerald-600 text-white hover:bg-emerald-600",
  RENT: "bg-primary text-primary-foreground hover:bg-primary",
  PG: "bg-amber-500 text-white hover:bg-amber-500",
  HOSTEL: "bg-fuchsia-500 text-white hover:bg-fuchsia-500",
  COMMERCIAL: "bg-chart-3 text-white hover:bg-chart-3",
};

export function Property({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<PropertyListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [type, setType] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const openChat = useNX((s) => s.openChat);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<PropertyListing[]>(
        `/api/property?type=${type}&q=${encodeURIComponent(q)}`
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
            placeholder="Search by title, address, locality..."
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Post Property
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
        {TYPES.map((t) => (
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
            <Card key={i} className="h-80 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No properties listed yet. Post a property to find a tenant or buyer in your neighborhood!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PropertyCard
              key={p.id}
              p={p}
              onContact={() => openChat(`property-${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ p, onContact }: { p: PropertyListing; onContact: () => void }) {
  const isSell = p.type === "SELL";
  const priceText = isSell
    ? inr(p.price)
    : `${inr(p.rent)}/mo`;

  return (
    <Card className="overflow-hidden flex flex-col group">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/20 via-muted to-amber-500/15 overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-primary/50">
            {p.type === "COMMERCIAL" ? (
              <Building2 className="h-12 w-12" />
            ) : (
              <Home className="h-12 w-12" />
            )}
          </div>
        )}
        <Badge className={cn("absolute left-2 top-2 gap-1", TYPE_BADGE[p.type] || "bg-muted")}>
          {p.type}
        </Badge>
        <Badge variant="secondary" className="absolute right-2 top-2">
          {p.propertyType}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="text-base font-bold text-primary">{priceText}</div>
          {!isSell && p.deposit > 0 && (
            <div className="text-[10px] text-muted-foreground text-right">
              Deposit
              <div className="text-xs font-semibold text-foreground">{inr(p.deposit)}</div>
            </div>
          )}
        </div>
        <div className="mt-0.5 text-sm font-medium line-clamp-1">{p.title}</div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {p.type !== "COMMERCIAL" && p.type !== "PLOT" && (
            <>
              <span className="flex items-center gap-1">
                <Bed className="h-3 w-3" /> {p.bedrooms} BHK
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-3 w-3" /> {p.bathrooms}
              </span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="h-3 w-3" /> {p.area}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {FURNISHING.find((f) => f.key === p.furnishing)?.label || p.furnishing}
          </Badge>
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{p.address || p.location}</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-2.5">
          <div className="flex items-center gap-1.5">
            <UserAvatar user={p.owner} size="h-6 w-6" />
            <span className="text-xs text-muted-foreground">
              {p.owner.name.split(" ")[0]} · {timeAgo(p.createdAt)}
            </span>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={onContact}>
            <MessageCircle className="h-3.5 w-3.5" /> Contact
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
    type: "RENT",
    propertyType: "2BHK",
    price: "0",
    rent: "12000",
    deposit: "24000",
    area: "800 Sq.ft",
    furnishing: "SEMI",
    address: "",
    imageUrl: "",
    bedrooms: "2",
    bathrooms: "1",
    amenities: "",
    location: "",
  });
  const [saving, setSaving] = React.useState(false);

  const isSell = form.type === "SELL";

  async function submit() {
    if (!form.title || !form.address) {
      toast.error("Title and address required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/property?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Property posted! 🏠");
      onCreated();
    } catch {
      toast.error("Failed to post property");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Post a property</DialogTitle>
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
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.filter((t) => t.key !== "ALL").map((t) => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.propertyType}
            onValueChange={(v) => setForm({ ...form, propertyType: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isSell ? (
            <Input
              placeholder="Sale price ₹ *"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          ) : (
            <Input
              placeholder="Monthly rent ₹ *"
              type="number"
              min={0}
              value={form.rent}
              onChange={(e) => setForm({ ...form, rent: e.target.value })}
            />
          )}
          <Input
            placeholder="Deposit ₹"
            type="number"
            min={0}
            value={form.deposit}
            onChange={(e) => setForm({ ...form, deposit: e.target.value })}
            disabled={isSell}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Area (e.g. 800 Sq.ft)"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
          <Select
            value={form.furnishing}
            onValueChange={(v) => setForm({ ...form, furnishing: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FURNISHING.map((f) => (
                <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Bedrooms"
            type="number"
            min={0}
            value={form.bedrooms}
            onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
          />
          <Input
            placeholder="Bathrooms"
            type="number"
            min={0}
            value={form.bathrooms}
            onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
          />
        </div>
        <Input
          placeholder="Address *"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <Input
          placeholder="Locality (optional)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <Input
          placeholder="Amenities (comma-separated, optional)"
          value={form.amenities}
          onChange={(e) => setForm({ ...form, amenities: e.target.value })}
        />
        <Input
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {saving ? "Posting..." : "Post Property"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
