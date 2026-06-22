"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Business } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, MapPin, Phone, BadgeCheck, Tag, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "GROCERY", label: "🛒 Grocery" },
  { key: "RESTAURANT", label: "🍽️ Restaurant" },
  { key: "CLINIC", label: "🏥 Clinic" },
  { key: "PHARMACY", label: "💊 Pharmacy" },
  { key: "SALON", label: "💈 Salon" },
  { key: "GYM", label: "💪 Gym" },
  { key: "RETAIL", label: "🛍️ Retail" },
];

export function Businesses() {
  const [items, setItems] = React.useState<Business[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api<Business[]>(
          `/api/businesses?category=${cat}&q=${encodeURIComponent(q)}`
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
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search businesses..."
            className="pl-9"
          />
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-56 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <BusinessCard key={b.id} b={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function BusinessCard({ b }: { b: Business }) {
  return (
    <Card className="overflow-hidden flex flex-col group">
      <div className="relative h-28 bg-muted overflow-hidden">
        {b.imageUrl ? (
          <img src={b.imageUrl} alt={b.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center brand-gradient-soft">
            <Store className="h-9 w-9 text-primary" />
          </div>
        )}
        {b.featured && (
          <Badge className="absolute left-2 top-2 gap-1 bg-amber-500 text-white hover:bg-amber-500">
            <Star className="h-3 w-3 fill-current" /> Featured
          </Badge>
        )}
        {b.verified && (
          <Badge className="absolute right-2 top-2 gap-1 bg-primary text-primary-foreground hover:bg-primary">
            <BadgeCheck className="h-3 w-3" /> Verified
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold leading-tight">{b.name}</div>
          <div className="flex items-center gap-0.5 text-xs font-semibold shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {b.rating}
          </div>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{b.reviewCount} reviews</div>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>
        {b.offer && (
          <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-400">
            <Tag className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{b.offer}</span>
          </div>
        )}
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {b.address}</div>
        </div>
        <div className="mt-3 flex gap-2 border-t pt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 flex-1 gap-1.5"
            onClick={() => toast.success(`Calling ${b.name}...`)}
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </Button>
          <Button size="sm" className="h-8 flex-1 gap-1.5" onClick={() => toast.success("Directions opened in map")}>
            <MapPin className="h-3.5 w-3.5" /> Directions
          </Button>
        </div>
      </div>
    </Card>
  );
}
