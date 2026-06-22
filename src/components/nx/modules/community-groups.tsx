"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Group } from "@/lib/types";
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
import { Plus, Users, Lock, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const CATEGORIES: { key: string; label: string; emoji: string; tint: string }[] = [
  { key: "ALL", label: "All", emoji: "🌐", tint: "bg-primary/15 text-primary" },
  { key: "SPORTS", label: "Sports", emoji: "🏏", tint: "bg-chart-2/15 text-chart-2" },
  { key: "WOMEN", label: "Women", emoji: "👩‍👩‍👧", tint: "bg-fuchsia-500/15 text-fuchsia-600" },
  { key: "RELIGIOUS", label: "Religious", emoji: "🛕", tint: "bg-amber-500/15 text-amber-600" },
  { key: "PROFESSIONAL", label: "Professional", emoji: "💼", tint: "bg-chart-4/15 text-chart-4" },
  { key: "PETS", label: "Pets", emoji: "🐾", tint: "bg-orange-500/15 text-orange-600" },
  { key: "OTHER", label: "Other", emoji: "👥", tint: "bg-muted text-muted-foreground" },
];

const CAT_EMOJI: Record<string, string> = {
  SPORTS: "🏏",
  WOMEN: "👩‍👩‍👧",
  RELIGIOUS: "🛕",
  PROFESSIONAL: "💼",
  PETS: "🐾",
  YOUTH: "🎓",
  SENIORS: "👴",
  PARENTS: "👨‍👩‍👧",
  HOBBIES: "🎨",
  VOLUNTEER: "🤝",
  OTHER: "👥",
};

const SCOPE_LABEL: Record<string, string> = {
  SOCIETY: "Society",
  AREA: "Area",
  CITY: "City",
};

function tintFor(cat: string): string {
  return CATEGORIES.find((c) => c.key === cat)?.tint || "bg-muted text-muted-foreground";
}

export function CommunityGroups({ uid }: { uid: string }) {
  const [items, setItems] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState("ALL");
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Group[]>(
        `/api/groups${cat !== "ALL" ? `?category=${cat}` : ""}`
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [cat]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Community Groups</h2>
          <p className="text-xs text-muted-foreground">
            Find your people — sports, faith, work, pets & more.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 tap-feedback">
              <Plus className="h-4 w-4" /> Create Group
            </Button>
          </DialogTrigger>
          <CreateGroupDialog
            uid={uid}
            onCreated={() => {
              setOpen(false);
              load();
            }}
          />
        </Dialog>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors tap-feedback",
              cat === c.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <div className="text-3xl mb-2">🤝</div>
          No groups here yet. Be the first to start one!
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <GroupCard key={g.id} g={g} uid={uid} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({
  g,
  uid,
  onChanged,
}: {
  g: Group;
  uid: string;
  onChanged: () => void;
}) {
  const emoji = g.icon || CAT_EMOJI[g.category] || "👥";
  const isMember =
    g.members?.some((m) => m.userId === uid) || g.ownerId === uid;
  const [joined, setJoined] = React.useState(isMember);
  const [toggling, setToggling] = React.useState(false);

  async function toggle() {
    if (g.ownerId === uid) {
      toast.info("You're the owner of this group");
      return;
    }
    setToggling(true);
    try {
      const res = await api<{ joined: boolean }>(
        `/api/groups/${g.id}/join?uid=${uid}`,
        { method: "POST" }
      );
      setJoined(res.joined);
      toast.success(res.joined ? `Joined ${g.name} 🎉` : `Left ${g.name}`);
      onChanged();
    } catch {
      toast.error("Couldn't update membership");
    } finally {
      setToggling(false);
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-start gap-3 p-4 pb-3">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl",
            tintFor(g.category)
          )}
        >
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold leading-tight">{g.name}</h3>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {g.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-4">
        <Badge variant="secondary" className="text-[10px]">
          {SCOPE_LABEL[g.scope] || g.scope}
        </Badge>
        <Badge variant="outline" className="text-[10px] gap-1">
          {g.privacy === "PRIVATE" ? (
            <>
              <Lock className="h-3 w-3" /> Private
            </>
          ) : (
            <>
              <Globe className="h-3 w-3" /> Public
            </>
          )}
        </Badge>
        <Badge variant="outline" className="text-[10px] gap-1">
          <Users className="h-3 w-3" /> {g.memberCount}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t p-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <UserAvatar user={g.owner} size="h-6 w-6" />
          <span className="truncate text-xs text-muted-foreground">
            by {g.owner.name}
          </span>
        </div>
        <Button
          size="sm"
          variant={joined ? "outline" : "default"}
          disabled={toggling}
          onClick={toggle}
          className="gap-1.5 tap-feedback"
        >
          {joined ? (
            <>
              <Check className="h-3.5 w-3.5" /> Joined
            </>
          ) : (
            "Join"
          )}
        </Button>
      </div>
    </Card>
  );
}

function CreateGroupDialog({
  uid,
  onCreated,
}: {
  uid: string;
  onCreated: () => void;
}) {
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    category: "OTHER",
    privacy: "PUBLIC",
    scope: "AREA",
  });
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!form.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/groups?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({ ...form, ownerId: uid }),
      });
      toast.success("Group created! 🎉");
      setForm({
        name: "",
        description: "",
        category: "OTHER",
        privacy: "PUBLIC",
        scope: "AREA",
      });
      onCreated();
    } catch {
      toast.error("Failed to create group");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Start a Community Group</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <Input
          placeholder="Group name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Textarea
          placeholder="What is this group about?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {c.emoji} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.privacy}
            onValueChange={(v) => setForm({ ...form, privacy: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">🌐 Public</SelectItem>
              <SelectItem value="PRIVATE">🔒 Private</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={form.scope}
            onValueChange={(v) => setForm({ ...form, scope: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SOCIETY">🏢 Society</SelectItem>
              <SelectItem value="AREA">📍 Area</SelectItem>
              <SelectItem value="CITY">🏙️ City</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {saving ? "Creating..." : "Create Group"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
