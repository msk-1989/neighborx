"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/types";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  Users,
  Bell,
  UserCheck,
  ClipboardList,
  Shield,
  Megaphone,
  Wrench,
  CalendarDays,
  AlertTriangle,
  Plus,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ----- inline types (not added to types.ts per task instructions) -----
interface SocietyNotice {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  societyId: string;
}
interface Visitor {
  id: string;
  visitorName: string;
  visitorPhone?: string | null;
  hostName: string;
  hostFlat: string;
  status: string;
  purpose?: string | null;
  createdAt: string;
}
interface Society {
  id: string;
  name: string;
  address: string;
  area: string;
  city: string;
  totalUnits: number;
  notices: SocietyNotice[];
  admin?: { id: string; name: string; email: string; avatar?: string | null } | null;
}

// Color-coded notice styles — per task spec
const NOTICE_STYLES: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  ANNOUNCEMENT: {
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Megaphone,
    label: "Announcement",
  },
  MAINTENANCE: {
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Wrench,
    label: "Maintenance",
  },
  MEETING: {
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
    icon: CalendarDays,
    label: "Meeting",
  },
  EMERGENCY: {
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    icon: AlertTriangle,
    label: "Emergency",
  },
};

const VISITOR_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  APPROVED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  CHECKED_IN: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  CHECKED_OUT: "bg-muted text-muted-foreground",
  DENIED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function Society({ uid }: { uid: string }) {
  return (
    <Tabs defaultValue="notices" className="w-full">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="notices" className="gap-1.5">
          <Bell className="h-3.5 w-3.5" /> Notices
        </TabsTrigger>
        <TabsTrigger value="visitor" className="gap-1.5">
          <UserCheck className="h-3.5 w-3.5" /> Visitor Pass
        </TabsTrigger>
        <TabsTrigger value="directory" className="gap-1.5">
          <Building2 className="h-3.5 w-3.5" /> Directory
        </TabsTrigger>
      </TabsList>
      <TabsContent value="notices">
        <NoticesTab uid={uid} />
      </TabsContent>
      <TabsContent value="visitor">
        <VisitorTab uid={uid} />
      </TabsContent>
      <TabsContent value="directory">
        <DirectoryTab uid={uid} />
      </TabsContent>
    </Tabs>
  );
}

function NoticesTab({ uid }: { uid: string }) {
  const [society, setSociety] = React.useState<Society | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api<Society>(`/api/society?uid=${uid}`);
        setSociety(data);
      } catch {
        toast.error("Failed to load society notices");
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted/40" />
        ))}
      </div>
    );
  }

  const notices = society?.notices ?? [];
  if (notices.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
        No notices yet. Society announcements will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      {notices.map((n) => {
        const style = NOTICE_STYLES[n.type] || NOTICE_STYLES.ANNOUNCEMENT;
        const Icon = style.icon;
        return (
          <Card key={n.id} className={cn("p-4 border", style.color)}>
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background/60">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{n.title}</h3>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {n.body}
                </p>
                <Badge
                  variant="outline"
                  className={cn("mt-2 text-[10px]", style.color)}
                >
                  {style.label}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function VisitorTab({ uid }: { uid: string }) {
  const [visitors, setVisitors] = React.useState<Visitor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [form, setForm] = React.useState({
    visitorName: "",
    visitorPhone: "",
    hostName: "",
    hostFlat: "",
    purpose: "",
  });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [v, u] = await Promise.all([
        api<Visitor[]>(`/api/society/visitor?uid=${uid}`),
        api<User>(`/api/me?id=${uid}`),
      ]);
      setVisitors(v);
      setUser(u);
      setForm((f) => ({ ...f, hostName: f.hostName || u.name }));
    } catch {
      toast.error("Failed to load visitor passes");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!form.visitorName.trim() || !form.hostFlat.trim()) {
      toast.error("Visitor name and your flat are required");
      return;
    }
    setSaving(true);
    try {
      await api(`/api/society/visitor?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Visitor pass issued! 🎫");
      setForm({
        visitorName: "",
        visitorPhone: "",
        hostName: user?.name || "",
        hostFlat: "",
        purpose: "",
      });
      load();
    } catch {
      toast.error("Failed to issue visitor pass");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Pre-Approve a Visitor</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Visitor name *"
            value={form.visitorName}
            onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
          />
          <Input
            placeholder="Visitor phone (optional)"
            value={form.visitorPhone}
            onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })}
          />
          <Input
            placeholder="Host name"
            value={form.hostName}
            onChange={(e) => setForm({ ...form, hostName: e.target.value })}
          />
          <Input
            placeholder="Your flat (e.g. A-302) *"
            value={form.hostFlat}
            onChange={(e) => setForm({ ...form, hostFlat: e.target.value })}
          />
        </div>
        <Textarea
          placeholder="Purpose of visit (optional)"
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          className="mt-3 min-h-[60px]"
        />
        <Button
          onClick={submit}
          disabled={saving}
          className="mt-3 w-full sm:w-auto gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {saving ? "Issuing..." : "Issue Pass"}
        </Button>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Recent Visitor Passes</h3>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-16 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : visitors.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No visitor passes yet. Issue one above.
          </Card>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {visitors.map((v) => (
              <Card
                key={v.id}
                className="p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {v.visitorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {v.visitorName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      → {v.hostName} · {v.hostFlat}
                      {v.purpose ? ` · ${v.purpose}` : ""}
                    </div>
                    {v.visitorPhone && (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {v.visitorPhone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      VISITOR_STATUS_STYLES[v.status] ||
                        VISITOR_STATUS_STYLES.PENDING
                    )}
                  >
                    {v.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(v.createdAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DirectoryTab({ uid }: { uid: string }) {
  const [society, setSociety] = React.useState<Society | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api<Society>(`/api/society?uid=${uid}`);
        setSociety(data);
      } catch {
        toast.error("Failed to load society directory");
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  if (loading) {
    return <Card className="h-48 animate-pulse bg-muted/40" />;
  }
  if (!society) return null;

  const stats = [
    { label: "Total Units", value: society.totalUnits, icon: Building2 },
    { label: "Active Notices", value: society.notices.length, icon: Bell },
    { label: "Area", value: society.area, icon: MapPin },
    { label: "City", value: society.city, icon: Users },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="brand-gradient h-20" />
        <div className="px-4 pb-4">
          <div className="-mt-8 flex items-end gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-card border-4 border-card shadow-sm">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div className="pb-1">
              <h2 className="text-lg font-bold">{society.name}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {society.address}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              <div className="mt-1 text-xl font-bold truncate">
                {s.value}
              </div>
            </Card>
          );
        })}
      </div>

      {society.admin && (
        <Card className="p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Society Admin</div>
            <div className="text-sm font-semibold truncate">
              {society.admin.name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {society.admin.email}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
