"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { BorrowItem } from "@/lib/types";
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
  HandHelping,
  Search,
  Plus,
  MapPin,
  MessageCircle,
  Sparkles,
  PackageOpen,
  Clock,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "BOOKS", label: "📚 Books" },
  { key: "TOOLS", label: "🔧 Tools" },
  { key: "EQUIPMENT", label: "🏋️ Equipment" },
  { key: "MEDICAL", label: "🩺 Medical" },
  { key: "SPORTS", label: "⚽ Sports" },
  { key: "APPLIANCES", label: "🔌 Appliances" },
  { key: "OTHER", label: "📦 Other" },
];

const TYPE_OPTIONS = [
  { key: "ALL", label: "All" },
  { key: "LEND", label: "🤝 Lending" },
  { key: "BORROW", label: "🙏 Want to borrow" },
];

export function Borrow({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<BorrowItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [type, setType] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const openChat = useNX((s) => s.openChat);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<BorrowItem[]>(
        `/api/borrow?category=${cat}&type=${type}&q=${encodeURIComponent(q)}`
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [cat, type, q]);

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
            placeholder="Search borrow & lend..."
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Post
            </Button>
          </DialogTrigger>
          <BorrowDialog
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
            <Card key={i} className="h-72 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No items found. Be the first to share something with your neighbors!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <BorrowCard
              key={it.id}
              item={it}
              onChat={() => openChat(`borrow-${it.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BorrowCard({
  item,
  onChat,
}: {
  item: BorrowItem;
  onChat: () => void;
}) {
  const isLend = item.type === "LEND";
  return (
    <Card className="overflow-hidden flex flex-col group">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <HandHelping className="h-10 w-10" />
          </div>
        )}
        <Badge
          className={cn(
            "absolute left-2 top-2 gap-1 text-white",
            isLend ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-600 hover:bg-amber-600"
          )}
        >
          {isLend ? "🤝 Lending" : "🙏 Want to borrow"}
        </Badge>
        <Badge variant="secondary" className="absolute right-2 top-2">
          {item.condition}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {CATEGORIES.find((c) => c.key === item.category)?.label ?? item.category}
          </Badge>
        </div>
        <div className="mt-1.5 line-clamp-1 text-sm font-semibold">{item.title}</div>
        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <IndianRupee className="h-3 w-3" />
            {item.dailyRate > 0 ? `${item.dailyRate}/day` : "Free"}
          </span>
          {item.deposit > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> {inr(item.deposit)} deposit
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {item.duration}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {item.location}
        </div>

        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-1.5">
            <UserAvatar user={item.owner} size="h-6 w-6" />
            <span className="text-xs text-muted-foreground">
              {item.owner.name.split(" ")[0]}
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

function BorrowDialog({
  uid,
  onCreated,
}: {
  uid: string;
  onCreated: () => void;
}) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    type: "LEND",
    category: "OTHER",
    condition: "Good",
    dailyRate: "",
    deposit: "",
    duration: "7 days",
    imageUrl: "",
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
      await api(`/api/borrow?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success(
        form.type === "LEND" ? "Item listed for lending! 🤝" : "Borrow request posted! 🙏"
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
          <PackageOpen className="h-5 w-5 text-primary" /> Borrow & Lend
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Input
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Description (condition, what's included, etc.)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LEND">🤝 I'm lending</SelectItem>
              <SelectItem value="BORROW">🙏 I want to borrow</SelectItem>
            </SelectContent>
          </Select>
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
          <Select
            value={form.condition}
            onValueChange={(v) => setForm({ ...form, condition: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["New", "Good", "Fair"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Max duration (e.g. 7 days)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Daily rate ₹ (0 = free)"
            type="number"
            value={form.dailyRate}
            onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
          />
          <Input
            placeholder="Security deposit ₹"
            type="number"
            value={form.deposit}
            onChange={(e) => setForm({ ...form, deposit: e.target.value })}
          />
        </div>
        <Input
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <Input
          placeholder="Location (optional — defaults to your area)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {saving ? "Posting..." : "Post"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
