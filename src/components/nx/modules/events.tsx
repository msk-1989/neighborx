"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { NXEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, Users, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

export function Events({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<NXEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api<NXEvent[]>("/api/events"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function rsvp(id: string, status: "GOING" | "INTERESTED") {
    await api(`/api/events/${id}/rsvp?uid=${uid}`, { method: "POST", body: JSON.stringify({ status }) });
    toast.success(status === "GOING" ? "You're going! 🎉" : "Marked as interested");
    load();
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Card key={i} className="h-40 animate-pulse bg-muted/40" />)}</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((e) => {
        const going = e.rsvps.filter((r) => r.status === "GOING").length;
        const interested = e.rsvps.filter((r) => r.status === "INTERESTED").length;
        return (
          <Card key={e.id} className="overflow-hidden flex flex-col sm:flex-row">
            {e.imageUrl && (
              <div className="sm:w-44 h-32 sm:h-auto shrink-0 bg-muted overflow-hidden">
                <img src={e.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex-1 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{e.title}</div>
                  <Badge variant="outline" className="mt-0.5 text-[10px]">{e.category}</Badge>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 justify-end font-medium text-foreground"><CalendarDays className="h-3.5 w-3.5" /> {e.date}</div>
                  <div className="flex items-center gap-1 justify-end mt-0.5"><Clock className="h-3 w-3" /> {e.time}</div>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.venue}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {going} going · {interested} interested</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-2.5">
                <div className="flex items-center gap-1.5">
                  <UserAvatar user={e.organizer} size="h-6 w-6" />
                  <span className="text-xs text-muted-foreground">by {e.organizer.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => rsvp(e.id, "INTERESTED")}>
                    <Star className="h-3.5 w-3.5" /> Interested
                  </Button>
                  <Button size="sm" className="h-8 gap-1.5" onClick={() => rsvp(e.id, "GOING")}>
                    <Check className="h-3.5 w-3.5" /> Going
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
