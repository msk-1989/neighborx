"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Briefcase, MapPin, Users, Clock, Search, CheckCircle2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATEGORIES = [
  { key: "ALL", label: "All Jobs" },
  { key: "DELIVERY", label: "📦 Delivery" },
  { key: "RETAIL", label: "🛍️ Retail" },
  { key: "SALES", label: "📈 Sales" },
  { key: "TECH", label: "💻 Tech" },
  { key: "ACCOUNTS", label: "🧮 Accounts" },
  { key: "GENERAL", label: "📋 General" },
];

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-primary/15 text-primary",
  PART_TIME: "bg-chart-2/15 text-chart-2",
  CONTRACT: "bg-chart-5/15 text-chart-5",
  INTERNSHIP: "bg-chart-4/15 text-chart-4",
  REMOTE: "bg-chart-1/15 text-chart-1",
};

export function Jobs({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [applyJob, setApplyJob] = React.useState<Job | null>(null);

  React.useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api<Job[]>(
          `/api/jobs?category=${cat}&q=${encodeURIComponent(q)}`
        );
        setItems(data);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [cat, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs by title or company..." className="pl-9" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-28 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No jobs found</Card>
      ) : (
        <div className="space-y-3">
          {items.map((j) => (
            <JobCard key={j.id} j={j} onApply={() => setApplyJob(j)} />
          ))}
        </div>
      )}

      <Dialog open={!!applyJob} onOpenChange={(o) => !o && setApplyJob(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {applyJob?.title}</DialogTitle>
          </DialogHeader>
          {applyJob && <ApplyForm job={applyJob} uid={uid} onDone={() => setApplyJob(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JobCard({ j, onApply }: { j: Job; onApply: () => void }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{j.title}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" /> {j.company}
                <span>·</span>
                <Clock className="h-3 w-3" /> {timeAgo(j.createdAt)}
              </div>
            </div>
            <Badge className={cn("gap-1", JOB_TYPE_COLORS[j.jobType] || "bg-muted")}>
              {j.jobType.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{j.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-primary">💰 {j.salary}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {j.location}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" /> {j.openings} opening{j.openings > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1.5">
          <UserAvatar user={j.employer} size="h-6 w-6" />
          <span className="text-xs text-muted-foreground">Posted by {j.employer.name}</span>
        </div>
        <Button size="sm" className="gap-1.5" onClick={onApply}>
          <CheckCircle2 className="h-4 w-4" /> Apply Now
        </Button>
      </div>
    </Card>
  );
}

function ApplyForm({ job, uid, onDone }: { job: Job; uid: string; onDone: () => void }) {
  const [cover, setCover] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    setSaving(true);
    try {
      await api(`/api/jobs/${job.id}/apply?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({ cover }),
      });
      toast.success("Application submitted! 🎯");
      onDone();
    } catch {
      toast.error("Application failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="rounded-md bg-muted px-3 py-2 text-xs">
          <div className="font-semibold">{job.title} · {job.company}</div>
          <div className="text-muted-foreground">{job.salary} · {job.location}</div>
        </div>
        <Textarea
          placeholder="Why are you a good fit? (cover note, optional)"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="text-xs text-muted-foreground">
          Your profile (name, contact) will be shared with the employer.
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          {saving ? "Submitting..." : "Submit Application"}
        </Button>
      </DialogFooter>
    </>
  );
}
