"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Fundraiser } from "@/lib/types";
import { inr, timeAgo } from "@/lib/types";
import { useNX } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  BadgeCheck,
  CalendarClock,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "MEDICAL", label: "🏥 Medical" },
  { key: "EDUCATION", label: "📚 Education" },
  { key: "NGO", label: "🤝 NGO" },
  { key: "COMMUNITY", label: "🏘️ Community" },
  { key: "EMERGENCY", label: "🆘 Emergency" },
  { key: "ANIMALS", label: "🐾 Animals" },
];

const QUICK_AMOUNTS = [100, 500, 1000, 2500];

export function Fundraising({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<Fundraiser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const openChat = useNX((s) => s.openChat);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Fundraiser[]>(
        `/api/fundraising?category=${cat}&q=${encodeURIComponent(q)}`
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
            placeholder="Search fundraisers..."
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Start a Campaign
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
            <Card key={i} className="h-80 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No active fundraisers. Start a campaign to rally your neighbors!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <FundraiserCard
              key={f.id}
              fr={f}
              uid={uid}
              onChat={() => openChat(`fundraiser-${f.id}`)}
              onDonated={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FundraiserCard({
  fr,
  uid,
  onChat,
  onDonated,
}: {
  fr: Fundraiser;
  uid: string;
  onChat: () => void;
  onDonated: () => void;
}) {
  const pct = fr.goal > 0 ? Math.min(100, Math.round((fr.raised / fr.goal) * 100)) : 0;
  const [donateOpen, setDonateOpen] = React.useState(false);

  return (
    <Card className="overflow-hidden flex flex-col group">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/30 via-amber-500/20 to-fuchsia-500/20 overflow-hidden">
        {fr.imageUrl ? (
          <img
            src={fr.imageUrl}
            alt={fr.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-primary/60">
            <HeartHandshake className="h-12 w-12" />
          </div>
        )}
        {fr.verified && (
          <Badge className="absolute left-2 top-2 gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
            <BadgeCheck className="h-3 w-3" /> Verified
          </Badge>
        )}
        <Badge variant="secondary" className="absolute right-2 top-2 capitalize">
          {fr.category.toLowerCase()}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="text-sm font-semibold leading-tight line-clamp-2">{fr.title}</div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{fr.description}</p>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="h-3 w-3" />
          <span className="truncate">For {fr.beneficiaryName}</span>
          {fr.endDate && (
            <>
              <span>·</span>
              <CalendarClock className="h-3 w-3" />
              <span className="truncate">ends {fr.endDate}</span>
            </>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-base font-bold text-primary">{inr(fr.raised)}</div>
              <div className="text-[10px] text-muted-foreground">
                raised of {inr(fr.goal)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{pct}%</div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users className="h-3 w-3" /> {(fr.donations || []).length} donations
              </div>
            </div>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-2.5">
          <div className="flex items-center gap-1.5">
            <UserAvatar user={fr.organizer} size="h-6 w-6" />
            <span className="text-xs text-muted-foreground">
              by {fr.organizer.name.split(" ")[0]} · {timeAgo(fr.createdAt)}
            </span>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7" onClick={onChat}>
              Chat
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1"
              onClick={() => setDonateOpen(true)}
            >
              <Heart className="h-3.5 w-3.5" /> Donate
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Donate to {fr.title}</DialogTitle>
          </DialogHeader>
          <DonateForm
            fr={fr}
            uid={uid}
            onDone={() => {
              setDonateOpen(false);
              onDonated();
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function DonateForm({
  fr,
  uid,
  onDone,
}: {
  fr: Fundraiser;
  uid: string;
  onDone: () => void;
}) {
  const [amount, setAmount] = React.useState("500");
  const [message, setMessage] = React.useState("");
  const [anonymous, setAnonymous] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    const amt = Number(amount);
    if (!amt || amt < 1) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/fundraising/${fr.id}/donate?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({ amount: amt, message, anonymous }),
      });
      toast.success("Donation received! Thank you 🙏");
      onDone();
    } catch {
      toast.error("Donation failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="rounded-md bg-muted px-3 py-2 text-xs">
          <div className="font-semibold">{fr.title}</div>
          <div className="text-muted-foreground">
            {inr(fr.raised)} raised of {inr(fr.goal)} goal
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                amount === String(a)
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted"
              )}
            >
              {inr(a)}
            </button>
          ))}
        </div>
        <Input
          type="number"
          min={1}
          placeholder="Custom amount ₹"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Textarea
          placeholder="Message of support (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px]"
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={anonymous}
            onCheckedChange={(v) => setAnonymous(v === true)}
          />
          Donate anonymously
        </label>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Heart className="h-4 w-4" />
          {saving ? "Processing..." : `Donate ${inr(Number(amount) || 0)}`}
        </Button>
      </DialogFooter>
    </>
  );
}

function CreateDialog({ uid, onCreated }: { uid: string; onCreated: () => void }) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    story: "",
    category: "COMMUNITY",
    goal: "50000",
    beneficiaryName: "",
    endDate: "",
    imageUrl: "",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.title || !form.description || !form.beneficiaryName) {
      toast.error("Title, description, and beneficiary required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/fundraising?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Campaign started! 🎗️");
      onCreated();
    } catch {
      toast.error("Failed to start campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Start a fundraising campaign</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Input
          placeholder="Campaign title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Short description *"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Textarea
          placeholder="Full story (who, what, why)"
          value={form.story}
          onChange={(e) => setForm({ ...form, story: e.target.value })}
          className="min-h-[100px]"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Beneficiary name *"
            value={form.beneficiaryName}
            onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
          />
          <Input
            placeholder="Goal amount ₹"
            type="number"
            min={1}
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="End date (optional)"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
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
          {saving ? "Starting..." : "Start Campaign"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
