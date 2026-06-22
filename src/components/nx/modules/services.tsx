"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";
import { inr } from "@/lib/types";
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
import { Wrench, Star, Phone, BadgeCheck, CalendarClock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "ALL", label: "All Services" },
  { key: "ELECTRICIAN", label: "⚡ Electrician" },
  { key: "PLUMBER", label: "🔧 Plumber" },
  { key: "TUTOR", label: "📚 Tutor" },
  { key: "MAID", label: "🧹 Maid" },
  { key: "DRIVER", label: "🚗 Driver" },
  { key: "CARPENTER", label: "🪚 Carpenter" },
  { key: "PAINTER", label: "🎨 Painter" },
  { key: "CLEANING", label: "✨ Deep Cleaning" },
];

export function Services({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [bookSvc, setBookSvc] = React.useState<Service | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api<Service[]>(`/api/services?category=${cat}`);
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [cat]);

  return (
    <div className="space-y-4">
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
            <Card key={i} className="h-52 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <ServiceCard key={s.id} s={s} onBook={() => setBookSvc(s)} />
          ))}
        </div>
      )}

      <Dialog open={!!bookSvc} onOpenChange={(o) => !o && setBookSvc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {bookSvc?.providerName}</DialogTitle>
          </DialogHeader>
          {bookSvc && <BookingForm svc={bookSvc} uid={uid} onDone={() => setBookSvc(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServiceCard({ s, onBook }: { s: Service; onBook: () => void }) {
  return (
    <Card className="p-4 flex flex-col">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Wrench className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate">{s.providerName}</span>
            {s.verified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
          </div>
          <Badge variant="secondary" className="mt-0.5 text-[10px]">{s.category}</Badge>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{s.bio}</p>
      <div className="mt-2 flex items-center gap-3 text-xs">
        <span className="flex items-center gap-0.5 font-medium">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          {s.rating}
        </span>
        <span className="text-muted-foreground">{s.jobsDone} jobs</span>
        <span className="font-semibold text-primary">{inr(s.hourlyRate)}/hr</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="h-8 flex-1 gap-1.5" onClick={() => toast.success(`Calling ${s.providerName}...`)}>
          <Phone className="h-3.5 w-3.5" /> Call
        </Button>
        <Button size="sm" className="h-8 flex-1 gap-1.5" onClick={onBook} disabled={!s.available}>
          <CalendarClock className="h-3.5 w-3.5" /> {s.available ? "Book" : "Busy"}
        </Button>
      </div>
    </Card>
  );
}

function BookingForm({ svc, uid, onDone }: { svc: Service; uid: string; onDone: () => void }) {
  const [date, setDate] = React.useState("");
  const [slot, setSlot] = React.useState("10:00 AM - 12:00 PM");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!date) {
      toast.error("Please pick a date");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/services/${svc.id}/book?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({ date, slot, note }),
      });
      toast.success(`Booking request sent to ${svc.providerName} ✅`);
      onDone();
    } catch {
      toast.error("Booking failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Time slot</label>
            <Select value={slot} onValueChange={setSlot}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea
          placeholder="Describe the work (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[70px]"
        />
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Rate: <b>{inr(svc.hourlyRate)}/hr</b> · Estimated 2 hrs
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <CalendarClock className="h-4 w-4" />
          {saving ? "Booking..." : "Confirm Booking"}
        </Button>
      </DialogFooter>
    </>
  );
}
