"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { YellowPageEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HeartPulse,
  GraduationCap,
  Wrench,
  Store,
  Building2,
  Church,
  Siren,
  Search as SearchIcon,
  Plus,
  MapPin,
  Clock,
  Phone,
  Globe,
  Star,
  BadgeCheck,
  Mail,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * NeighborX Yellow Pages — hyperlocal directory (discovery layer).
 *
 * Product principle: this is a DIRECTORY, not a social feed. No likes,
 * no comments, no follows. Pure discovery — find a doctor, school,
 * electrician, restaurant, police station, temple, ambulance.
 */

type CategoryDef = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  subcategories: string[];
};

const CATEGORIES: CategoryDef[] = [
  {
    key: "HEALTHCARE",
    label: "Healthcare",
    icon: HeartPulse,
    color: "text-rose-600",
    bg: "bg-rose-500/10",
    subcategories: ["Doctors", "Hospitals", "Labs", "Pharmacies"],
  },
  {
    key: "EDUCATION",
    label: "Education",
    icon: GraduationCap,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    subcategories: ["Schools", "Colleges", "Coaching Centers", "Tutors"],
  },
  {
    key: "HOME_SERVICES",
    label: "Home Services",
    icon: Wrench,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    subcategories: ["Electricians", "Plumbers", "Painters", "Drivers"],
  },
  {
    key: "BUSINESS",
    label: "Business",
    icon: Store,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    subcategories: ["Restaurants", "Hotels", "Shops", "Retailers", "Wholesalers"],
  },
  {
    key: "GOVERNMENT",
    label: "Government",
    icon: Building2,
    color: "text-purple-600",
    bg: "bg-purple-500/10",
    subcategories: ["Police", "Municipality", "Electricity", "Water Department"],
  },
  {
    key: "RELIGIOUS",
    label: "Religious",
    icon: Church,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
    subcategories: ["Mosques", "Temples", "Churches", "Madrasas"],
  },
  {
    key: "EMERGENCY",
    label: "Emergency",
    icon: Siren,
    color: "text-red-600",
    bg: "bg-red-500/10",
    subcategories: ["Ambulance", "Blood Banks", "Fire Stations"],
  },
];

function categoryDef(key: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

export function YellowPages({ uid }: { uid: string }) {
  const [entries, setEntries] = React.useState<YellowPageEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<YellowPageEntry | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (activeSubcategory) params.set("subcategory", activeSubcategory);
      if (query.trim()) params.set("q", query.trim());
      const data = await api<YellowPageEntry[]>(`/api/yellow-pages?${params}`);
      setEntries(data);
    } catch {
      toast.error("Could not load directory");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSubcategory, query]);

  // Debounced search
  React.useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function selectCategory(key: string) {
    if (activeCategory === key) {
      setActiveCategory(null);
      setActiveSubcategory(null);
    } else {
      setActiveCategory(key);
      setActiveSubcategory(null);
    }
  }

  const activeCatDef = activeCategory ? categoryDef(activeCategory) : undefined;
  const countsByCat = React.useMemo(() => {
    const m: Record<string, number> = {};
    // only meaningful when no category filter is applied — counts from current entries
    for (const e of entries) m[e.category] = (m[e.category] || 0) + 1;
    return m;
  }, [entries]);

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Yellow Pages</h1>
          <p className="text-sm text-muted-foreground">
            Hyperlocal directory for Udgir
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Listing
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search doctors, schools, restaurants…"
          aria-label="Search yellow pages"
          className="pl-9"
        />
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = activeCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => selectCategory(c.key)}
              className={cn(
                "tap-feedback flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                active
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:bg-accent/30",
              )}
            >
              <div className={cn("grid h-10 w-10 place-items-center rounded-full", c.bg)}>
                <Icon className={cn("h-5 w-5", c.color)} />
              </div>
              <span className="text-xs font-medium leading-tight">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subcategory chips */}
      {activeCatDef && (
        <div className="nx-scrollbar-thin flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubcategory(null)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              !activeSubcategory
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            All {activeCatDef.label}
          </button>
          {activeCatDef.subcategories.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSubcategory(s)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeSubcategory === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <SearchIcon className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No listings found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search or add the first listing.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            Add Listing
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {entries.length} listing{entries.length !== 1 ? "s" : ""}
            {activeCatDef ? ` in ${activeCatDef.label}` : ""}
          </p>
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} onClick={() => setSelected(e)} />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      <EntryDetailSheet
        entry={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />

      {/* Create sheet */}
      <CreateListingSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        uid={uid}
        onCreated={(e) => {
          setEntries((arr) => [e, ...arr]);
          setCreateOpen(false);
          toast.success("Listing added ✓");
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────
// Entry card
// ────────────────────────────────────────────────
function EntryCard({ entry, onClick }: { entry: YellowPageEntry; onClick: () => void }) {
  const cat = categoryDef(entry.category);
  const Icon = cat?.icon ?? Store;
  return (
    <button onClick={onClick} className="tap-feedback w-full text-left">
      <Card className="flex items-start gap-3 p-3 transition-all hover:shadow-md">
        {/* Thumbnail or icon */}
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.name}
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-lg", cat?.bg || "bg-muted")}>
            <Icon className={cn("h-6 w-6", cat?.color || "text-muted-foreground")} />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-semibold leading-tight">{entry.name}</h3>
                {entry.verified && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Verified" />
                )}
              </div>
              <Badge variant="outline" className="mt-0.5 px-1.5 py-0 text-[10px]">
                {entry.subcategory}
              </Badge>
            </div>
            {entry.rating > 0 && (
              <div className="flex shrink-0 items-center gap-0.5 text-xs">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{entry.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({entry.reviewCount})</span>
              </div>
            )}
          </div>
          {entry.description && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {entry.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {entry.area}
            </span>
            {entry.hours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {entry.hours}
              </span>
            )}
            {entry.phone && (
              <span className="flex items-center gap-1 text-primary">
                <Phone className="h-3 w-3" /> {entry.phone}
              </span>
            )}
          </div>
        </div>
      </Card>
    </button>
  );
}

// ────────────────────────────────────────────────
// Detail sheet
// ────────────────────────────────────────────────
function EntryDetailSheet({
  entry,
  open,
  onOpenChange,
}: {
  entry: YellowPageEntry | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!entry) return null;
  const cat = categoryDef(entry.category);
  const Icon = cat?.icon ?? Store;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${entry.name}, ${entry.address}, ${entry.area}, ${entry.city}`,
  )}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90vh] max-w-md overflow-y-auto rounded-t-2xl p-0 pb-safe"
      >
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-left">{entry.name}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          {/* hero */}
          <div className="flex items-start gap-3">
            {entry.imageUrl ? (
              <img
                src={entry.imageUrl}
                alt={entry.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div className={cn("grid h-16 w-16 place-items-center rounded-xl", cat?.bg || "bg-muted")}>
                <Icon className={cn("h-7 w-7", cat?.color || "text-muted-foreground")} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {entry.subcategory}
                </Badge>
                {entry.verified && (
                  <Badge className="gap-1 bg-emerald-500/15 px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              {entry.rating > 0 && (
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{entry.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    · {entry.reviewCount} reviews
                  </span>
                </div>
              )}
            </div>
          </div>

          {entry.description && (
            <p className="text-sm text-muted-foreground">{entry.description}</p>
          )}

          {/* details */}
          <div className="space-y-2.5 rounded-lg border p-3 text-sm">
            <DetailRow icon={MapPin} label="Address">
              {entry.address}, {entry.area}, {entry.city}
            </DetailRow>
            {entry.hours && (
              <DetailRow icon={Clock} label="Hours">
                {entry.hours}
              </DetailRow>
            )}
            {entry.phone && (
              <DetailRow icon={Phone} label="Phone">
                <a href={`tel:${entry.phone}`} className="text-primary hover:underline">
                  {entry.phone}
                </a>
              </DetailRow>
            )}
            {entry.email && (
              <DetailRow icon={Mail} label="Email">
                <a href={`mailto:${entry.email}`} className="text-primary hover:underline">
                  {entry.email}
                </a>
              </DetailRow>
            )}
            {entry.website && (
              <DetailRow icon={Globe} label="Website">
                <a
                  href={entry.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {entry.website}
                </a>
              </DetailRow>
            )}
          </div>

          {/* actions */}
          <div className="flex gap-2">
            <Button asChild className="flex-1 gap-1.5">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" /> Get Directions
              </a>
            </Button>
            {entry.phone && (
              <Button asChild variant="outline" className="gap-1.5">
                <a href={`tel:${entry.phone}`}>
                  <Phone className="h-4 w-4" /> Call
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Create listing sheet
// ────────────────────────────────────────────────
function CreateListingSheet({
  open,
  onOpenChange,
  uid,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  uid: string;
  onCreated: (e: YellowPageEntry) => void;
}) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<string>("BUSINESS");
  const [subcategory, setSubcategory] = React.useState<string>("Shops");
  const [description, setDescription] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [hours, setHours] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [posting, setPosting] = React.useState(false);

  const catDef = categoryDef(category);
  const subcats = catDef?.subcategories || ["Shops"];

  // when category changes, reset subcategory to first option
  React.useEffect(() => {
    if (catDef && !catDef.subcategories.includes(subcategory)) {
      setSubcategory(catDef.subcategories[0]);
    }
  }, [catDef, subcategory]);

  function reset() {
    setName("");
    setCategory("BUSINESS");
    setSubcategory("Shops");
    setDescription("");
    setAddress("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setHours("");
    setImageUrl("");
  }

  async function submit() {
    if (!name.trim() || !address.trim()) {
      toast.error("Name and address are required");
      return;
    }
    setPosting(true);
    try {
      const entry = await api<YellowPageEntry>(`/api/yellow-pages?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({
          name,
          category,
          subcategory,
          description: description || undefined,
          address,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          hours: hours || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });
      onCreated(entry);
      reset();
    } catch {
      toast.error("Failed to add listing");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92vh] max-w-md overflow-y-auto rounded-t-2xl p-0 pb-safe"
      >
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-left">Add a Listing</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 px-4 pb-4">
          <Field label="Name *">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sharma Kirana Store" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Subcategory">
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subcats.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this place offer?"
              rows={2}
            />
          </Field>
          <Field label="Address *">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Phone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98220XXXXX" />
            </Field>
            <Field label="Hours">
              <Input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="9 AM - 9 PM" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Email">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@..." />
            </Field>
            <Field label="Website">
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          <Field label="Image URL">
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://...jpg" />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t p-3 pb-safe">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={posting || !name.trim() || !address.trim()} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {posting ? "Adding..." : "Add Listing"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
