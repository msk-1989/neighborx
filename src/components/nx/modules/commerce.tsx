"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { CommerceProduct } from "@/lib/types";
import { inr, timeAgo } from "@/lib/types";
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
  ShoppingBasket,
  Search,
  Plus,
  MapPin,
  Truck,
  Sparkles,
  Store,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "GROCERY", label: "🛒 Grocery" },
  { key: "FOOD", label: "🍔 Food" },
  { key: "MEDICINE", label: "💊 Medicine" },
  { key: "PARCELS", label: "📦 Parcels" },
  { key: "RENTALS", label: "🔧 Rentals" },
];

const CAT_BADGE: Record<string, string> = {
  GROCERY: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  FOOD: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  MEDICINE: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  PARCELS: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  RENTALS: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
};

export function Commerce({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<CommerceProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [listOpen, setListOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<CommerceProduct[]>(
        `/api/commerce?category=${cat}&q=${encodeURIComponent(q)}`
      );
      setItems(data);
    } catch {
      toast.error("Failed to load products");
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
            placeholder="Search shops & products..."
            className="pl-9"
          />
        </div>
        <Dialog open={listOpen} onOpenChange={setListOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> List Product
            </Button>
          </DialogTrigger>
          <ListProductDialog
            uid={uid}
            onCreated={() => {
              setListOpen(false);
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
            <Card key={i} className="h-72 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <ShoppingBasket className="mx-auto h-8 w-8 mb-2 opacity-50" />
          No products found. Be the first to list something!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} uid={uid} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p, uid }: { p: CommerceProduct; uid: string }) {
  const [orderOpen, setOrderOpen] = React.useState(false);
  const catColor = CAT_BADGE[p.category] || "bg-muted text-muted-foreground";

  return (
    <Card className="overflow-hidden flex flex-col group">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <ShoppingBasket className="h-10 w-10" />
          </div>
        )}
        <Badge
          variant="secondary"
          className={cn("absolute left-2 top-2 text-[10px]", catColor)}
        >
          {CATEGORIES.find((c) => c.key === p.category)?.label || p.category}
        </Badge>
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {p.inStock ? (
            <Badge className="bg-emerald-500/90 text-white hover:bg-emerald-500 text-[10px] gap-0.5">
              <CheckCircle2 className="h-3 w-3" /> In stock
            </Badge>
          ) : (
            <Badge className="bg-muted text-muted-foreground hover:bg-muted text-[10px] gap-0.5">
              <XCircle className="h-3 w-3" /> Out
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="text-base font-bold text-primary">{inr(p.price)}</div>
        <div className="mt-0.5 line-clamp-1 text-sm font-medium">{p.title}</div>
        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {p.description}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Store className="h-3 w-3" /> {p.storeName}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Truck className="h-3 w-3" /> {p.deliveryTime}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" /> {p.location}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <UserAvatar user={p.seller} size="h-6 w-6" />
            <span className="text-xs text-muted-foreground truncate">
              {p.seller.name.split(" ")[0]}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              · {timeAgo(p.createdAt)}
            </span>
          </div>
        </div>
        <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
          <Button
            size="sm"
            className="mt-2 h-8 w-full gap-1.5"
            disabled={!p.inStock}
            onClick={() => setOrderOpen(true)}
          >
            <Package className="h-3.5 w-3.5" />
            {p.inStock ? "Order Now" : "Unavailable"}
          </Button>
          <OrderDialog
            p={p}
            uid={uid}
            onDone={() => setOrderOpen(false)}
          />
        </Dialog>
      </div>
    </Card>
  );
}

function OrderDialog({
  p,
  uid,
  onDone,
}: {
  p: CommerceProduct;
  uid: string;
  onDone: () => void;
}) {
  const [qty, setQty] = React.useState("1");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const qtyNum = Number(qty) || 1;
  const total = qtyNum * p.price;

  async function submit() {
    if (qtyNum < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/commerce/${p.id}/order?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({ qty: qtyNum, note }),
      });
      toast.success("Order placed! 🛍️");
      onDone();
      setQty("1");
      setNote("");
    } catch {
      toast.error("Failed to place order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Order {p.title}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-background">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.title}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <ShoppingBasket className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{p.title}</div>
            <div className="text-xs text-muted-foreground truncate">
              {p.storeName} · {inr(p.price)} each
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Quantity</label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Total</label>
            <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3 text-sm font-bold text-primary">
              {inr(total)}
            </div>
          </div>
        </div>
        <Textarea
          placeholder="Delivery note (e.g. ring doorbell, leave at gate)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[60px]"
        />
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs">
          <Truck className="h-3.5 w-3.5 text-primary" />
          Delivery: <b>{p.deliveryTime}</b>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {saving ? "Placing..." : `Place Order · ${inr(total)}`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ListProductDialog({
  uid,
  onCreated,
}: {
  uid: string;
  onCreated: () => void;
}) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    price: "",
    category: "GROCERY",
    storeName: "",
    deliveryTime: "Same day",
    imageUrl: "",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.title.trim() || !form.price) {
      toast.error("Title and price are required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/commerce?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Product listed! 🛒");
      onCreated();
      setForm({
        title: "",
        description: "",
        price: "",
        category: "GROCERY",
        storeName: "",
        deliveryTime: "Same day",
        imageUrl: "",
      });
    } catch {
      toast.error("Failed to list product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>List a product</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Input
          placeholder="Product title *"
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
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Store name"
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          />
          <Select
            value={form.deliveryTime}
            onValueChange={(v) => setForm({ ...form, deliveryTime: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["30 min", "1 hour", "2 hours", "Same day", "Next day"].map(
                (t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {saving ? "Listing..." : "List Product"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
