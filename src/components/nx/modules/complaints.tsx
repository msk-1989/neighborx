"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Complaint } from "@/lib/types";
import { timeAgo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { ShieldAlert, MapPin, ThumbsUp, Plus, Sparkles, Image as ImageIcon, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATS = [
  { key: "ROAD", label: "🛣️ Road Damage" },
  { key: "GARBAGE", label: "🗑️ Garbage" },
  { key: "WATER", label: "💧 Water Issue" },
  { key: "ELECTRICITY", label: "⚡ Electricity" },
  { key: "STREETLIGHT", label: "💡 Streetlight" },
  { key: "DRAINAGE", label: "🚿 Drainage" },
  { key: "OTHER", label: "📋 Other" },
];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  SUBMITTED: { label: "Submitted", color: "bg-muted text-muted-foreground", icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400", icon: Clock },
  RESOLVED: { label: "Resolved", color: "bg-primary/15 text-primary", icon: CheckCircle2 },
};

export function Complaints({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<Complaint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("ALL");
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api<Complaint[]>(`/api/complaints?status=${status}`));
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function upvote(id: string) {
    const c = await api<Complaint>(`/api/complaints?uid=${uid}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "upvote", id }),
    });
    setItems((arr) => arr.map((x) => (x.id === id ? c : x)));
    toast.success("Upvoted — more visibility for this issue 👍");
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 brand-gradient-soft">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Civic Complaints · AI-Powered</div>
            <div className="text-sm text-muted-foreground">
              Upload a photo of a civic issue — our AI auto-categorizes it for faster municipal routing.
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5"><Plus className="h-4 w-4" /> Report Issue</Button>
            </DialogTrigger>
            <ComplaintDialog uid={uid} onCreated={() => { setOpen(false); load(); }} />
          </Dialog>
        </div>
      </Card>

      <div className="flex flex-wrap gap-1.5">
        {["ALL", "SUBMITTED", "IN_PROGRESS", "RESOLVED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {s === "ALL" ? "All" : STATUS_META[s]?.label || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Card key={i} className="h-32 animate-pulse bg-muted/40" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No complaints in this filter</Card>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <ComplaintCard key={c.id} c={c} onUpvote={() => upvote(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ComplaintCard({ c, onUpvote }: { c: Complaint; onUpvote: () => void }) {
  const cat = CATS.find((x) => x.key === c.category);
  const st = STATUS_META[c.status] || STATUS_META.SUBMITTED;
  const StIcon = st.icon;
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {c.imageUrl ? (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img src={c.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ) : (
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
            <ShieldAlert className="h-7 w-7" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="font-semibold text-sm">{c.title}</div>
            <Badge className={cn("gap-1 text-[10px]", st.color)}>
              <StIcon className="h-3 w-3" /> {st.label}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{c.description}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{cat?.label || c.category}</Badge>
            {c.aiCategory && (
              <Badge className="gap-1 bg-primary/10 text-primary px-1.5 py-0 text-[10px]">
                <Sparkles className="h-2.5 w-2.5" /> AI: {c.aiCategory} ({Math.round((c.aiConfidence || 0) * 100)}%)
              </Badge>
            )}
            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {c.location}</span>
            <span>· {timeAgo(c.createdAt)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-1.5">
              <UserAvatar user={c.reporter} size="h-5 w-5" />
              <span className="text-[11px] text-muted-foreground">{c.reporter.name}</span>
            </div>
            <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={onUpvote}>
              <ThumbsUp className="h-3.5 w-3.5" /> {c.upvotes}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ComplaintDialog({ uid, onCreated }: { uid: string; onCreated: () => void }) {
  const [form, setForm] = React.useState({
    category: "GARBAGE",
    title: "",
    description: "",
    location: "",
    imageUrl: "",
  });
  const [aiResult, setAiResult] = React.useState<{ category: string; confidence: number; summary: string; urgency: string } | null>(null);
  const [classifying, setClassifying] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function classify() {
    if (!form.imageUrl) {
      toast.error("Add an image URL first to auto-classify");
      return;
    }
    setClassifying(true);
    try {
      const r = await api<{ category: string; confidence: number; summary: string; urgency: string }>("/api/complaints/classify", {
        method: "POST",
        body: JSON.stringify({ imageUrl: form.imageUrl }),
      });
      setAiResult(r);
      setForm((f) => ({ ...f, category: r.category }));
      toast.success(`AI classified as ${r.category} (${Math.round(r.confidence * 100)}%)`);
    } catch {
      toast.error("AI classification failed");
    } finally {
      setClassifying(false);
    }
  }

  async function submit() {
    if (!form.title) {
      toast.error("Please add a title");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/complaints?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          aiCategory: aiResult?.category || null,
          aiConfidence: aiResult?.confidence || null,
        }),
      });
      toast.success("Complaint filed with municipality 📋");
      onCreated();
    } catch {
      toast.error("Failed to file complaint");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" /> Report a Civic Issue
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs font-medium flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Issue Photo URL
          </label>
          <div className="flex gap-2">
            <Input placeholder="https://..." value={form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setAiResult(null); }} />
            <Button type="button" variant="secondary" className="gap-1.5 shrink-0" onClick={classify} disabled={classifying}>
              {classifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {classifying ? "AI..." : "Auto-classify"}
            </Button>
          </div>
        </div>

        {aiResult && (
          <Card className="p-3 bg-primary/5 border-primary/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Analysis
            </div>
            <div className="mt-1.5 space-y-1 text-xs">
              <div>Category: <b>{aiResult.category}</b> · Urgency: <b>{aiResult.urgency}</b></div>
              <div className="text-muted-foreground">{aiResult.summary}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Confidence</span>
                <Progress value={aiResult.confidence * 100} className="h-1.5 flex-1" />
                <span className="text-[10px] font-medium">{Math.round(aiResult.confidence * 100)}%</span>
              </div>
            </div>
          </Card>
        )}

        {form.imageUrl && (
          <div className="overflow-hidden rounded-lg border max-h-40">
            <img src={form.imageUrl} alt="preview" className="w-full object-cover max-h-40" />
          </div>
        )}

        <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Describe the issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[80px]" />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATS.map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <ShieldAlert className="h-4 w-4" />
          {saving ? "Filing..." : "File Complaint"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
