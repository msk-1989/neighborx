"use client";

/**
 * AdminPanel — Super Admin dashboard for the NeighborX hyperlocal platform.
 * 16 module sections with a vertical tab rail (lg+) / horizontal strip (mobile).
 * Each section fetches its data from /api/admin/* routes and supports the
 * admin actions (delete/approve/etc.) defined in those routes.
 */
import * as React from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { timeAgo, inr, type User, type Post, type Listing, type Business, type Emergency, type Complaint, type Job, type NXEvent, type WatchAlert } from "@/lib/types";
import { UserAvatar } from "../user-bits";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  LayoutDashboard, Users, Newspaper, ShieldCheck, ShoppingBag, Store, Wrench, Briefcase,
  Building2, Siren, Home, Scale, Wallet, HeadphonesIcon, Settings as SettingsIcon,
  CheckCircle2, XCircle, Trash2, Star, Check, Loader2, Crown, AlertTriangle,
  ArrowRight, MapPin, TrendingUp, Search, ShieldAlert, MessageSquare,
  RotateCw, Eye, ChevronDown, KeyRound, FileText, Tag, TreePine,
} from "lucide-react";

// ============================================================================
// Shared types (admin API responses)
// ============================================================================
interface AdminStats {
  stats: {
    users: number; posts: number; businesses: number; services: number; jobs: number;
    listings: number; emergencies: number; complaints: number; groups: number; events: number;
    watchAlerts: number; pendingVerifications: number; pendingReports: number; openTickets: number;
    revenue: number;
  };
  recent: {
    posts: (Post & { author: User })[];
    users: { id: string; name: string; email: string; avatar?: string | null; createdAt: string; tier: string; role: string }[];
    reports: { id: string; targetType: string; targetId: string; reason: string; status: string; createdAt: string; reporter: { id: string; name: string; email: string } }[];
  };
}

interface AdminUser extends User {
  createdAt: string;
  roles?: { role: { code: string; name: string; level: number; category: string } }[];
}
interface AdminPost extends Post { _count?: { comments: number } }
interface AdminBusiness extends Business { owner?: { id: string; name: string; email: string; avatar?: string | null } }
interface AdminService {
  id: string; category: string; providerName: string; bio: string; phone: string;
  rating: number; jobsDone: number; hourlyRate: number; avatar?: string | null;
  verified: boolean; available: boolean; _count?: { bookings: number };
}
interface AdminJob extends Job { _count?: { applications: number } }
type AdminComplaint = Complaint;
type AdminEmergency = Emergency;
type AdminWatchAlert = WatchAlert;
interface AdminVerification {
  id: string; type: string; status: string; documentRef?: string | null; notes?: string | null;
  reviewedBy?: string | null; reviewedAt?: string | null; createdAt: string;
  requester: { id: string; name: string; email: string; avatar?: string | null; phone?: string | null };
}
interface AdminReport {
  id: string; targetType: string; targetId: string; reason: string; description?: string | null;
  status: string; action: string; createdAt: string; handledAt?: string | null;
  reporter: { id: string; name: string; email: string };
  handler?: { id: string; name: string; email: string } | null;
}
interface AdminTicket {
  id: string; type: string; status: string; priority: string; subject: string;
  description: string; resolution?: string | null; createdAt: string; updatedAt: string;
  requesterId: string; assigneeId?: string | null;
  requester: { id: string; name: string; email: string; avatar?: string | null };
  assignee?: { id: string; name: string; email: string } | null;
}
interface AdminPayment {
  id: string; type: string; amount: number; currency: string; status: string; gateway: string;
  txnRef?: string | null; invoiceNo?: string | null; createdAt: string;
  user: { id: string; name: string; email: string; avatar?: string | null };
}
interface AdminSubscription {
  id: string; plan: string; price: number; billingCycle: string; features: string; active: boolean;
}
interface AdminSociety {
  id: string; name: string; address: string; area: string; city: string; district: string;
  state: string; totalUnits: number; createdAt: string; visitorsToday: number;
  _count: { visitors: number; notices: number };
  admin?: { id: string; name: string; email: string; avatar?: string | null } | null;
}
interface AdminVisitor {
  id: string; visitorName: string; visitorPhone?: string | null; hostName: string; hostFlat: string;
  status: string; purpose?: string | null; checkInTime?: string | null; checkOutTime?: string | null;
  createdAt: string; society: { id: string; name: string; area: string; city: string };
}
interface AdminNotice {
  id: string; title: string; body: string; type: string; createdAt: string;
  society: { id: string; name: string; area: string; city: string };
}
interface AdminRole {
  id: string; code: string; name: string; description: string; level: number;
  category: string; isSystem: boolean; userCount: number; permissionCount: number;
  permissions: { code: string; name: string; module: string; action: string }[];
  expectedPermissions: string[];
  meta: { emoji: string; color: string } | null;
}

// ============================================================================
// Tab definitions
// ============================================================================
const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, desc: "Platform-wide snapshot" },
  { key: "users", label: "Users", icon: Users, desc: "Manage user accounts & roles" },
  { key: "community", label: "Community", icon: Newspaper, desc: "Moderate feed posts" },
  { key: "trust", label: "Trust & Verification", icon: ShieldCheck, desc: "Verify users, businesses, addresses" },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag, desc: "Listings & boosts" },
  { key: "businesses", label: "Businesses", icon: Store, desc: "Approve & feature businesses" },
  { key: "services", label: "Services", icon: Wrench, desc: "Service providers" },
  { key: "jobs", label: "Jobs", icon: Briefcase, desc: "Job board overview" },
  { key: "property", label: "Property", icon: Home, desc: "Coming soon" },
  { key: "safety", label: "Safety", icon: Siren, desc: "Emergencies & watch alerts" },
  { key: "society", label: "Society", icon: Building2, desc: "Societies, visitors, notices" },
  { key: "civic", label: "Civic", icon: Scale, desc: "Civic complaints" },
  { key: "finance", label: "Finance", icon: Wallet, desc: "Payments & subscriptions" },
  { key: "compliance", label: "Compliance", icon: AlertTriangle, desc: "Abuse reports" },
  { key: "support", label: "Support", icon: HeadphonesIcon, desc: "Support tickets" },
  { key: "settings", label: "Settings", icon: SettingsIcon, desc: "Locations, categories, CMS, roles" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ============================================================================
// Reusable bits
// ============================================================================
function StatCard({
  icon: Icon, label, value, color = "text-primary", hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: React.ReactNode; color?: string; hint?: string;
}) {
  return (
    <Card className="brand-gradient-soft p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">{value}</div>
          <div className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</div>
          {hint && <div className="mt-1 text-[11px] text-muted-foreground/80">{hint}</div>}
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
          <Icon className={cn("h-4.5 w-4.5", color)} />
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({
  icon: Icon, title, desc, action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; desc: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function SkeletonGrid({ count = 4, className = "h-24" }: { count?: number; className?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("animate-pulse rounded-lg bg-muted/40", className)} />
      ))}
    </div>
  );
}

function EmptyState({ emoji = "📭", title, desc }: { emoji?: string; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="text-3xl">{emoji}</div>
      <div className="font-semibold">{title}</div>
      {desc && <div className="max-w-sm text-sm text-muted-foreground">{desc}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    APPROVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    ACTIVE: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    RESOLVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    REVIEWING: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    ACTIONED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    DISMISSED: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
    OPEN: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    IN_PROGRESS: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    CLOSED: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
    SUBMITTED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    SUCCESS: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    FAILED: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    REFUNDED: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    AVAILABLE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    SOLD: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
    RESERVED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", map[status] || "bg-muted text-muted-foreground")}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    LOW: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
    MEDIUM: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    HIGH: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    URGENT: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", map[priority] || "bg-muted text-muted-foreground")}>
      {priority}
    </span>
  );
}

function useAdminData<T>(url: string, deps: unknown[] = []) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ data?: T } & T>(url);
      // Most routes return the payload under a top-level key like { users: [...] }
      // so we just store the whole response object.
      setData(res as T);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, ...deps]);

  React.useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load, setData };
}

async function callAdmin(url: string, init?: RequestInit) {
  return api<{ ok?: boolean; error?: string } & Record<string, unknown>>(url, init);
}

// ============================================================================
// Main component
// ============================================================================
export function AdminPanel({ uid }: { uid: string }) {
  const [tab, setTab] = React.useState<TabKey>("overview");

  return (
    <div className="space-y-4">
      {/* Banner */}
      <Card className="brand-gradient border-0 p-5 text-white shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight">Super Admin Panel</h1>
              <p className="text-xs text-white/80">NeighborX control center · 16 modules · IAM-secured</p>
            </div>
          </div>
          <Badge className="gap-1 self-start bg-white/15 text-white sm:self-auto">
            <ShieldCheck className="h-3 w-3" /> Full access
          </Badge>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="flex flex-col gap-4 lg:flex-row">
        <TabsList className="no-scrollbar h-auto w-full gap-1 overflow-x-auto p-1 lg:w-56 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="tap-feedback justify-start gap-2 px-3 py-2 text-sm lg:w-full"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="min-w-0 flex-1 space-y-4">
          <TabsContent value="overview"><OverviewSection uid={uid} /></TabsContent>
          <TabsContent value="users"><UsersSection uid={uid} /></TabsContent>
          <TabsContent value="community"><CommunitySection uid={uid} /></TabsContent>
          <TabsContent value="trust"><TrustSection uid={uid} /></TabsContent>
          <TabsContent value="marketplace"><MarketplaceSection uid={uid} /></TabsContent>
          <TabsContent value="businesses"><BusinessesSection uid={uid} /></TabsContent>
          <TabsContent value="services"><ServicesSection uid={uid} /></TabsContent>
          <TabsContent value="jobs"><JobsSection uid={uid} /></TabsContent>
          <TabsContent value="property"><PropertySection /></TabsContent>
          <TabsContent value="safety"><SafetySection uid={uid} /></TabsContent>
          <TabsContent value="society"><SocietySection uid={uid} /></TabsContent>
          <TabsContent value="civic"><CivicSection uid={uid} /></TabsContent>
          <TabsContent value="finance"><FinanceSection uid={uid} /></TabsContent>
          <TabsContent value="compliance"><ComplianceSection uid={uid} /></TabsContent>
          <TabsContent value="support"><SupportSection uid={uid} /></TabsContent>
          <TabsContent value="settings"><SettingsSection uid={uid} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ============================================================================
// 1. Overview
// ============================================================================
function OverviewSection({ uid }: { uid: string }) {
  const { data, loading } = useAdminData<AdminStats>(`/api/admin/stats?uid=${uid}`);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <SectionHeader icon={LayoutDashboard} title="Overview" desc="Platform-wide snapshot" />
        <SkeletonGrid count={8} />
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-lg bg-muted/40" />)}
        </div>
      </div>
    );
  }

  const s = data.stats;
  const cards = [
    { icon: Users, label: "Total Users", value: s.users, color: "text-emerald-600" },
    { icon: Newspaper, label: "Posts", value: s.posts, color: "text-chart-1" },
    { icon: Store, label: "Businesses", value: s.businesses, color: "text-amber-600" },
    { icon: Wrench, label: "Services", value: s.services, color: "text-cyan-600" },
    { icon: Briefcase, label: "Jobs", value: s.jobs, color: "text-violet-600" },
    { icon: ShoppingBag, label: "Listings", value: s.listings, color: "text-chart-3" },
    { icon: Siren, label: "Emergencies", value: s.emergencies, color: "text-rose-600" },
    { icon: Scale, label: "Complaints", value: s.complaints, color: "text-orange-600" },
    { icon: Users, label: "Groups", value: s.groups, color: "text-chart-3" },
    { icon: TrendingUp, label: "Events", value: s.events, color: "text-chart-2" },
    { icon: ShieldCheck, label: "Pending Verifs", value: s.pendingVerifications, color: "text-amber-600" },
    { icon: AlertTriangle, label: "Abuse Reports", value: s.pendingReports, color: "text-rose-600" },
    { icon: HeadphonesIcon, label: "Open Tickets", value: s.openTickets, color: "text-orange-600" },
    { icon: Wallet, label: "Revenue", value: inr(s.revenue), color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader icon={LayoutDashboard} title="Overview" desc="Platform-wide snapshot of all 16 modules" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent posts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm"><Newspaper className="h-4 w-4 text-primary" /> Recent Posts</CardTitle>
            <CardDescription>Latest 5 community posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recent.posts.length === 0 && <EmptyState emoji="📰" title="No posts yet" />}
              {data.recent.posts.map((p) => (
                <div key={p.id} className="rounded-lg border p-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserAvatar user={p.author} size="h-5 w-5" />
                    <span className="font-medium text-foreground">{p.author.name}</span>
                    <span>· {timeAgo(p.createdAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm">{p.content}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{p.scope}</Badge>
                    <span>❤️ {p.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent users */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" /> New Users</CardTitle>
            <CardDescription>Latest 5 sign-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recent.users.length === 0 && <EmptyState emoji="👤" title="No users yet" />}
              {data.recent.users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <UserAvatar user={u} size="h-8 w-8" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{u.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{u.tier}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent abuse reports */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-destructive" /> Abuse Reports</CardTitle>
            <CardDescription>Latest 5 reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recent.reports.length === 0 && <EmptyState emoji="✅" title="No abuse reports" />}
              {data.recent.reports.map((r) => (
                <div key={r.id} className="rounded-lg border p-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{r.targetType}</Badge>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-1 truncate text-sm">{r.reason}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    by {r.reporter.name} · {timeAgo(r.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Users
// ============================================================================
function UsersSection({ uid }: { uid: string }) {
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState("ALL");
  const [offset, setOffset] = React.useState(0);
  const limit = 25;
  const { data, loading, reload } = useAdminData<{ users: AdminUser[]; total: number }>(
    `/api/admin/users?uid=${uid}&q=${encodeURIComponent(q)}&role=${role === "ALL" ? "" : role}&limit=${limit}&offset=${offset}`,
    [q, role, offset],
  );

  const [roleDialog, setRoleDialog] = React.useState<AdminUser | null>(null);

  async function toggleVerify(u: AdminUser, action: "verify" | "unverify") {
    try {
      await callAdmin(`/api/admin/users/${u.id}?uid=${uid}`, {
        method: "PATCH", body: JSON.stringify({ action }),
      });
      toast.success(action === "verify" ? "User verified ✓" : "User unverified");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Users}
        title="User Management"
        desc={`${total} users · paginated ${limit} per page`}
        action={null}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setOffset(0); }} placeholder="Search by name, email, phone..." className="pl-9" />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setOffset(0); }}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Filter by role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="RESIDENT">Resident</SelectItem>
            <SelectItem value="VERIFIED_RESIDENT">Verified Resident</SelectItem>
            <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
            <SelectItem value="SERVICE_PROVIDER">Service Provider</SelectItem>
            <SelectItem value="EMPLOYER">Employer</SelectItem>
            <SelectItem value="PROPERTY_OWNER">Property Owner</SelectItem>
            <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
            <SelectItem value="SOCIETY_ADMIN">Society Admin</SelectItem>
            <SelectItem value="AREA_MODERATOR">Area Moderator</SelectItem>
            <SelectItem value="CITY_MODERATOR">City Moderator</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Users</CardTitle>
          <CardDescription>Showing {users.length} of {total}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : users.length === 0 ? (
            <EmptyState emoji="👤" title="No users found" desc="Try adjusting your search or filter" />
          ) : (
            <div className="max-h-[28rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar user={u} size="h-8 w-8" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{u.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(u.roles ?? []).map((r, i) => (
                            <Badge key={i} variant="outline" className="px-1.5 py-0 text-[10px]">{r.role.code}</Badge>
                          ))}
                          {u.verifyEmail && <Badge variant="outline" className="gap-0.5 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-700 dark:text-emerald-400"><Check className="h-2.5 w-2.5" />V</Badge>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{u.tier}</Badge></TableCell>
                      <TableCell className="tabular-nums">{u.rewardPoints}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(u.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs tap-feedback" onClick={() => setRoleDialog(u)}>
                            <KeyRound className="h-3 w-3" /> Roles
                          </Button>
                          {u.verifyEmail ? (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive tap-feedback" onClick={() => toggleVerify(u, "unverify")}>
                              Unverify
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 tap-feedback" onClick={() => toggleVerify(u, "verify")}>
                              <CheckCircle2 className="h-3 w-3" /> Verify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {total > limit && (
            <div className="mt-3 flex items-center justify-between">
              <Button size="sm" variant="outline" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="gap-1 tap-feedback">
                ← Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
              </span>
              <Button size="sm" variant="outline" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="gap-1 tap-feedback">
                Next →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {roleDialog && (
        <RoleAssignmentDialog uid={uid} user={roleDialog} onClose={() => setRoleDialog(null)} onDone={() => { setRoleDialog(null); reload(); }} />
      )}
    </div>
  );
}

function RoleAssignmentDialog({ uid, user, onClose, onDone }: {
  uid: string; user: AdminUser; onClose: () => void; onDone: () => void;
}) {
  const [roleCode, setRoleCode] = React.useState("RESIDENT");
  const [scope, setScope] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(action: "assign" | "remove") {
    setBusy(true);
    try {
      await callAdmin(`/api/admin/users/${user.id}/roles?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({ roleCode, scope: scope || undefined, action }),
      });
      toast.success(action === "assign" ? `Role ${roleCode} assigned` : `Role ${roleCode} removed`);
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage roles · {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {(user.roles ?? []).map((r, i) => (
              <Badge key={i} variant="outline" className="px-2 py-0.5 text-[11px]">
                {r.role.code}{r.role.code === "SOCIETY_ADMIN" ? " (scoped)" : ""}
              </Badge>
            ))}
          </div>
          <Select value={roleCode} onValueChange={setRoleCode}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["RESIDENT","VERIFIED_RESIDENT","BUSINESS_OWNER","SERVICE_PROVIDER","EMPLOYER","PROPERTY_OWNER","VOLUNTEER","SOCIETY_ADMIN","AREA_MODERATOR","CITY_MODERATOR","BUSINESS_ADMIN","ORG_ADMIN","SUPPORT_ADMIN","OPERATIONS_ADMIN","REVENUE_ADMIN","COMPLIANCE_ADMIN","SUPER_ADMIN"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Scope (e.g. 'Royal Residency') — leave empty for global" />
        </div>
        <DialogFooter>
          <Button variant="outline" className="gap-1.5 tap-feedback" disabled={busy} onClick={() => submit("remove")}>
            <XCircle className="h-4 w-4" /> Remove
          </Button>
          <Button className="gap-1.5 tap-feedback" disabled={busy} onClick={() => submit("assign")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Assign Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// 3. Community (posts)
// ============================================================================
function CommunitySection({ uid }: { uid: string }) {
  const [type, setType] = React.useState("ALL");
  const [scope, setScope] = React.useState("ALL");
  const { data, loading, reload } = useAdminData<{ posts: AdminPost[]; total: number }>(
    `/api/admin/posts?uid=${uid}&type=${type === "ALL" ? "" : type}&scope=${scope === "ALL" ? "" : scope}`,
    [type, scope],
  );

  async function del(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await callAdmin(`/api/admin/posts/${id}?uid=${uid}`, { method: "DELETE" });
      toast.success("Post deleted");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const posts = data?.posts ?? [];

  return (
    <div className="space-y-4">
      <SectionHeader icon={Newspaper} title="Community" desc="Moderate all feed posts" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Newspaper} label="Total Posts" value={data?.total ?? 0} />
        <StatCard icon={TrendingUp} label="Showing" value={posts.length} color="text-chart-2" />
        <StatCard icon={MessageSquare} label="With Comments" value={posts.filter((p) => (p._count?.comments ?? 0) > 0).length} color="text-chart-3" />
        <StatCard icon={Users} label="Unique Authors" value={new Set(posts.map((p) => p.authorId)).size} color="text-chart-1" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["ALL", "TEXT", "IMAGE", "VIDEO", "POLL", "EVENT", "EMERGENCY"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["ALL", "SOCIETY", "AREA", "CITY"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 tap-feedback" onClick={reload}>
          <RotateCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Posts</CardTitle>
          <CardDescription>{posts.length} posts loaded</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : posts.length === 0 ? (
            <EmptyState emoji="📰" title="No posts" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="max-w-xs"><div className="line-clamp-2 text-sm">{p.content}</div></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={p.author} size="h-6 w-6" />
                          <span className="text-xs">{p.author.name.split(" ")[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{p.type}</Badge></TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{p.scope}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">❤️ {p.likes} · 💬 {p._count?.comments ?? p.comments.length}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-destructive tap-feedback" onClick={() => del(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 4. Trust & Verification
// ============================================================================
function TrustSection({ uid }: { uid: string }) {
  const { data, loading, reload } = useAdminData<{ requests: AdminVerification[] }>(`/api/admin/verifications?uid=${uid}`);

  const reqs = data?.requests ?? [];
  const pending = reqs.filter((r) => r.status === "PENDING").length;
  const approved = reqs.filter((r) => r.status === "APPROVED").length;
  const rejected = reqs.filter((r) => r.status === "REJECTED").length;

  async function act(r: AdminVerification, status: "APPROVED" | "REJECTED") {
    try {
      await callAdmin(`/api/admin/verifications/${r.id}?uid=${uid}`, {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      toast.success(status === "APPROVED" ? "Request approved ✓" : "Request rejected");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={ShieldCheck} title="Trust & Verification" desc="Approve or reject verification requests" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={AlertTriangle} label="Pending" value={pending} color="text-amber-600" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} color="text-emerald-600" />
        <StatCard icon={XCircle} label="Rejected" value={rejected} color="text-rose-600" />
        <StatCard icon={ShieldCheck} label="Total Requests" value={reqs.length} color="text-chart-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Verification Requests</CardTitle>
          <CardDescription>Verify users, businesses, addresses</CardDescription>
          <CardAction><Button size="sm" variant="outline" className="gap-1.5 tap-feedback" onClick={reload}><RotateCw className="h-3.5 w-3.5" /> Refresh</Button></CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : reqs.length === 0 ? (
            <EmptyState emoji="✅" title="No verification requests" desc="All caught up!" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reqs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><Badge variant="outline" className="text-[10px]">{r.type}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={r.requester} size="h-6 w-6" />
                          <div className="min-w-0">
                            <div className="truncate text-xs font-medium">{r.requester.name}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{r.requester.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.documentRef || "—"}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {r.status === "PENDING" ? (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs tap-feedback" onClick={() => act(r, "REJECTED")}>
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                            <Button size="sm" className="h-7 gap-1 text-xs tap-feedback" onClick={() => act(r, "APPROVED")}>
                              <CheckCircle2 className="h-3 w-3" /> Approve
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {r.reviewedBy ? `by ${r.reviewedBy.slice(-4)}` : "—"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 5. Marketplace (listings)
// ============================================================================
function MarketplaceSection({ uid }: { uid: string }) {
  const { data, loading, reload } = useAdminData<{ listings: (Listing & { seller: User })[] }>(`/api/admin/listings?uid=${uid}`);

  const listings = data?.listings ?? [];

  async function del(id: string) {
    if (!confirm("Delete this listing?")) return;
    try {
      await callAdmin(`/api/admin/listings/${id}?uid=${uid}`, { method: "DELETE" });
      toast.success("Listing deleted");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  async function toggleBoost(l: Listing & { seller: User }) {
    try {
      await callAdmin(`/api/admin/listings/${l.id}?uid=${uid}`, {
        method: "PATCH", body: JSON.stringify({ boosted: !l.boosted }),
      });
      toast.success(l.boosted ? "Boost removed" : "Listing boosted ⚡");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={ShoppingBag} title="Marketplace" desc="All buy/sell listings" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total Listings" value={listings.length} />
        <StatCard icon={Star} label="Boosted" value={listings.filter((l) => l.boosted).length} color="text-amber-600" />
        <StatCard icon={CheckCircle2} label="Available" value={listings.filter((l) => l.status === "AVAILABLE").length} color="text-emerald-600" />
        <StatCard icon={Wallet} label="GMV (sum prices)" value={inr(listings.reduce((a, l) => a + l.price, 0))} color="text-chart-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Listings</CardTitle>
          <CardDescription>Boost or remove marketplace items</CardDescription>
          <CardAction><Button size="sm" variant="outline" className="gap-1.5 tap-feedback" onClick={reload}><RotateCw className="h-3.5 w-3.5" /> Refresh</Button></CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : listings.length === 0 ? (
            <EmptyState emoji="🛍️" title="No listings" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-2">
                          {l.imageUrl && <img src={l.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{l.title}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{l.condition} · {timeAgo(l.createdAt)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><div className="flex items-center gap-1.5"><UserAvatar user={l.seller} size="h-6 w-6" /><span className="text-xs">{l.seller.name.split(" ")[0]}</span></div></TableCell>
                      <TableCell className="font-medium text-primary">{inr(l.price)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{l.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <StatusBadge status={l.status} />
                          {l.boosted && <Badge className="gap-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 px-1.5 py-0 text-[10px]">⚡ Boosted</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => toggleBoost(l)}>
                            <Star className={cn("h-3.5 w-3.5", l.boosted && "fill-amber-400 text-amber-500")} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-destructive tap-feedback" onClick={() => del(l.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 6. Businesses
// ============================================================================
function BusinessesSection({ uid }: { uid: string }) {
  const { data, loading, reload } = useAdminData<{ businesses: AdminBusiness[] }>(`/api/admin/businesses?uid=${uid}`);
  const businesses = data?.businesses ?? [];

  async function patch(b: AdminBusiness, payload: { verified?: boolean; featured?: boolean }) {
    try {
      await callAdmin(`/api/admin/businesses/${b.id}?uid=${uid}`, { method: "PATCH", body: JSON.stringify(payload) });
      toast.success("Business updated");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={Store} title="Businesses" desc="Verify and feature local businesses" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Store} label="Total Businesses" value={businesses.length} />
        <StatCard icon={ShieldCheck} label="Verified" value={businesses.filter((b) => b.verified).length} color="text-emerald-600" />
        <StatCard icon={Star} label="Featured" value={businesses.filter((b) => b.featured).length} color="text-amber-600" />
        <StatCard icon={TrendingUp} label="Avg Rating" value={(businesses.reduce((a, b) => a + b.rating, 0) / Math.max(1, businesses.length)).toFixed(1)} color="text-chart-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Businesses</CardTitle>
          <CardDescription>Approve or feature business listings</CardDescription>
          <CardAction><Button size="sm" variant="outline" className="gap-1.5 tap-feedback" onClick={reload}><RotateCw className="h-3.5 w-3.5" /> Refresh</Button></CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : businesses.length === 0 ? (
            <EmptyState emoji="🏪" title="No businesses" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {b.imageUrl && <img src={b.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{b.name}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{b.address}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{b.category}</Badge></TableCell>
                      <TableCell><div className="flex items-center gap-1.5"><UserAvatar user={b.owner ?? { name: "—" }} size="h-6 w-6" /><span className="text-xs">{b.owner?.name ?? "—"}</span></div></TableCell>
                      <TableCell className="text-xs">⭐ {b.rating.toFixed(1)} <span className="text-muted-foreground">({b.reviewCount})</span></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {b.verified && <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0 text-[10px]">Verified</Badge>}
                          {b.featured && <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 px-1.5 py-0 text-[10px]">Featured</Badge>}
                          {!b.verified && !b.featured && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => patch(b, { verified: !b.verified })}>
                            <ShieldCheck className={cn("h-3.5 w-3.5", b.verified && "text-emerald-600")} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => patch(b, { featured: !b.featured })}>
                            <Star className={cn("h-3.5 w-3.5", b.featured && "fill-amber-400 text-amber-500")} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 7. Services
// ============================================================================
function ServicesSection({ uid }: { uid: string }) {
  const { data, loading, reload } = useAdminData<{ services: AdminService[] }>(`/api/admin/services?uid=${uid}`);
  const services = data?.services ?? [];

  async function patch(s: AdminService, payload: { verified?: boolean; available?: boolean }) {
    try {
      await callAdmin(`/api/admin/services/${s.id}?uid=${uid}`, { method: "PATCH", body: JSON.stringify(payload) });
      toast.success("Service updated");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={Wrench} title="Services" desc="Approve and manage service providers" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wrench} label="Total Providers" value={services.length} />
        <StatCard icon={ShieldCheck} label="Verified" value={services.filter((s) => s.verified).length} color="text-emerald-600" />
        <StatCard icon={CheckCircle2} label="Available" value={services.filter((s) => s.available).length} color="text-chart-2" />
        <StatCard icon={TrendingUp} label="Avg Rating" value={(services.reduce((a, s) => a + s.rating, 0) / Math.max(1, services.length)).toFixed(1)} color="text-amber-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Service Providers</CardTitle>
          <CardDescription>Verify or toggle availability</CardDescription>
          <CardAction><Button size="sm" variant="outline" className="gap-1.5 tap-feedback" onClick={reload}><RotateCw className="h-3.5 w-3.5" /> Refresh</Button></CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : services.length === 0 ? (
            <EmptyState emoji="🔧" title="No service providers" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar user={{ name: s.providerName, avatar: s.avatar }} size="h-8 w-8" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{s.providerName}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{s.bio}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{s.category}</Badge></TableCell>
                      <TableCell className="text-xs">{s.phone}</TableCell>
                      <TableCell className="text-xs">⭐ {s.rating.toFixed(1)}</TableCell>
                      <TableCell className="text-xs">{inr(s.hourlyRate)}/hr</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s._count?.bookings ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => patch(s, { verified: !s.verified })}>
                            <ShieldCheck className={cn("h-3.5 w-3.5", s.verified && "text-emerald-600")} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => patch(s, { available: !s.available })}>
                            {s.available ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 8. Jobs
// ============================================================================
function JobsSection({ uid }: { uid: string }) {
  const { data, loading } = useAdminData<{ jobs: AdminJob[] }>(`/api/admin/jobs?uid=${uid}`);
  const jobs = data?.jobs ?? [];

  return (
    <div className="space-y-4">
      <SectionHeader icon={Briefcase} title="Jobs" desc="Local job postings overview" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Total Jobs" value={jobs.length} />
        <StatCard icon={Users} label="Total Openings" value={jobs.reduce((a, j) => a + j.openings, 0)} color="text-chart-2" />
        <StatCard icon={TrendingUp} label="Applications" value={jobs.reduce((a, j) => a + (j._count?.applications ?? 0), 0)} color="text-emerald-600" />
        <StatCard icon={Building2} label="Companies" value={new Set(jobs.map((j) => j.company)).size} color="text-chart-3" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Jobs</CardTitle>
          <CardDescription>Job postings + application counts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : jobs.length === 0 ? (
            <EmptyState emoji="💼" title="No jobs posted" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Openings</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Posted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell>
                        <div className="text-sm font-medium">{j.title}</div>
                        <div className="text-[10px] text-muted-foreground">{j.salary}</div>
                      </TableCell>
                      <TableCell className="text-sm">{j.company}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={j.employer ?? { name: "—" }} size="h-6 w-6" />
                          <span className="text-xs">{j.employer?.name ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{j.jobType.replace("_", " ")}</Badge></TableCell>
                      <TableCell className="tabular-nums">{j.openings}</TableCell>
                      <TableCell className="tabular-nums">{j._count?.applications ?? 0}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(j.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 9. Property — coming soon
// ============================================================================
function PropertySection() {
  return (
    <div className="space-y-4">
      <SectionHeader icon={Home} title="Property" desc="Hyperlocal real estate module" />
      <Card className="brand-gradient-soft p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <div className="text-lg font-bold">Property Module — Coming Soon</div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Buy, sell, rent, and PG — hyperlocal real estate listings with broker verification, virtual tours,
              and Society Admin integration. This module is part of NeighborX Phase 3.
            </p>
          </div>
          <Badge className="gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" /> Phase 3 · In Roadmap
          </Badge>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// 10. Safety
// ============================================================================
function SafetySection({ uid }: { uid: string }) {
  const { data, loading, reload } = useAdminData<{ emergencies: AdminEmergency[]; watchAlerts: AdminWatchAlert[] }>(`/api/admin/emergencies?uid=${uid}`);
  const emergencies = data?.emergencies ?? [];
  const watchAlerts = data?.watchAlerts ?? [];

  async function act(id: string, status: "ACTIVE" | "RESOLVED") {
    try {
      await callAdmin(`/api/admin/emergencies/${id}?uid=${uid}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success(status === "RESOLVED" ? "Marked resolved ✓" : "Marked active");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={Siren} title="Safety" desc="Emergencies and neighborhood watch alerts" action={
        <Button size="sm" variant="outline" className="gap-1.5 tap-feedback" onClick={reload}><RotateCw className="h-3.5 w-3.5" /> Refresh</Button>
      } />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Siren} label="Emergencies" value={emergencies.length} color="text-rose-600" />
        <StatCard icon={ShieldAlert} label="Active SOS" value={emergencies.filter((e) => e.status === "ACTIVE").length} color="text-rose-600" />
        <StatCard icon={AlertTriangle} label="Watch Alerts" value={watchAlerts.length} color="text-orange-600" />
        <StatCard icon={CheckCircle2} label="Resolved" value={emergencies.filter((e) => e.status === "RESOLVED").length + watchAlerts.filter((w) => w.status === "RESOLVED").length} color="text-emerald-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Siren className="h-4 w-4 text-destructive" /> Emergencies</CardTitle>
          <CardDescription>SOS alerts from residents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : emergencies.length === 0 ? (
            <EmptyState emoji="🟢" title="No emergencies" desc="All clear!" />
          ) : (
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emergencies.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="max-w-[12rem]"><div className="truncate text-sm font-medium">{e.title}</div></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{e.category}</Badge></TableCell>
                      <TableCell><PriorityBadge priority={e.severity} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.location}</TableCell>
                      <TableCell className="text-xs">{e.reporter?.name ?? "—"}</TableCell>
                      <TableCell><StatusBadge status={e.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => act(e.id, e.status === "ACTIVE" ? "RESOLVED" : "ACTIVE")}>
                          {e.status === "ACTIVE" ? <Check className="h-3 w-3" /> : <RotateCw className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><ShieldAlert className="h-4 w-4 text-orange-600" /> Watch Alerts</CardTitle>
          <CardDescription>Neighborhood watch reports</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : watchAlerts.length === 0 ? (
            <EmptyState emoji="🛡️" title="No watch alerts" />
          ) : (
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchAlerts.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="max-w-[12rem]"><div className="truncate text-sm font-medium">{w.title}</div></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{w.type}</Badge></TableCell>
                      <TableCell><PriorityBadge priority={w.severity} /></TableCell>
                      <TableCell className="text-xs">{w.reporter?.name ?? "—"}</TableCell>
                      <TableCell><StatusBadge status={w.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => act(w.id, w.status === "ACTIVE" ? "RESOLVED" : "ACTIVE")}>
                          {w.status === "ACTIVE" ? <Check className="h-3 w-3" /> : <RotateCw className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 11. Society
// ============================================================================
function SocietySection({ uid }: { uid: string }) {
  const { data: socData, loading: l1 } = useAdminData<{ societies: AdminSociety[] }>(`/api/admin/societies?uid=${uid}`);
  const { data: visData, loading: l2 } = useAdminData<{ visitors: AdminVisitor[] }>(`/api/admin/visitors?uid=${uid}&limit=30`);
  const { data: notData, loading: l3 } = useAdminData<{ notices: AdminNotice[] }>(`/api/admin/notices?uid=${uid}`);

  const societies = socData?.societies ?? [];
  const visitors = visData?.visitors ?? [];
  const notices = notData?.notices ?? [];
  const visitorsToday = societies.reduce((a, s) => a + s.visitorsToday, 0);

  return (
    <div className="space-y-4">
      <SectionHeader icon={Building2} title="Society Management" desc="Societies, visitors, and notices" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Total Societies" value={societies.length} />
        <StatCard icon={Users} label="Visitors Today" value={visitorsToday} color="text-chart-2" />
        <StatCard icon={MessageSquare} label="Active Notices" value={notices.length} color="text-chart-3" />
        <StatCard icon={Home} label="Total Units" value={societies.reduce((a, s) => a + s.totalUnits, 0)} color="text-amber-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Societies</CardTitle>
          <CardDescription>Registered societies with admin info</CardDescription>
        </CardHeader>
        <CardContent>
          {l1 ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : societies.length === 0 ? (
            <EmptyState emoji="🏘️" title="No societies registered" />
          ) : (
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Area / City</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Visitors Today</TableHead>
                    <TableHead>Notices</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {societies.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell><div className="text-sm font-medium">{s.name}</div><div className="text-[10px] text-muted-foreground">{s.address}</div></TableCell>
                      <TableCell className="text-xs">{s.area}, {s.city}</TableCell>
                      <TableCell className="tabular-nums">{s.totalUnits}</TableCell>
                      <TableCell className="text-xs">{s.admin?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="tabular-nums">{s.visitorsToday}</TableCell>
                      <TableCell className="tabular-nums">{s._count.notices}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Visitors</CardTitle><CardDescription>Across all societies</CardDescription></CardHeader>
          <CardContent>
            {l2 ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/40" />)}</div>
            ) : visitors.length === 0 ? (
              <EmptyState emoji="🚶" title="No visitors logged" />
            ) : (
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Society</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitors.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell><div className="text-xs font-medium">{v.visitorName}</div><div className="text-[10px] text-muted-foreground">{v.visitorPhone || "—"}</div></TableCell>
                        <TableCell className="text-xs">{v.hostName} <span className="text-muted-foreground">({v.hostFlat})</span></TableCell>
                        <TableCell className="text-xs">{v.society.name}</TableCell>
                        <TableCell><StatusBadge status={v.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Society Notices</CardTitle><CardDescription>Published announcements</CardDescription></CardHeader>
          <CardContent>
            {l3 ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/40" />)}</div>
            ) : notices.length === 0 ? (
              <EmptyState emoji="📢" title="No notices" />
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto scrollbar-thin">
                {notices.map((n) => (
                  <div key={n.id} className="rounded-lg border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{n.title}</div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{n.society.name}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// 12. Civic
// ============================================================================
function CivicSection({ uid }: { uid: string }) {
  const { data, loading, reload } = useAdminData<{ complaints: AdminComplaint[] }>(`/api/admin/complaints?uid=${uid}`);
  const complaints = data?.complaints ?? [];

  async function update(id: string, status: string) {
    try {
      await callAdmin(`/api/admin/complaints/${id}?uid=${uid}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success(`Status → ${status}`);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={Scale} title="Civic Complaints" desc="Civic issues + AI auto-classification" action={
        <Button size="sm" variant="outline" className="gap-1.5 tap-feedback" onClick={reload}><RotateCw className="h-3.5 w-3.5" /> Refresh</Button>
      } />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Scale} label="Total Complaints" value={complaints.length} />
        <StatCard icon={AlertTriangle} label="Submitted" value={complaints.filter((c) => c.status === "SUBMITTED").length} color="text-amber-600" />
        <StatCard icon={Loader2} label="In Progress" value={complaints.filter((c) => c.status === "IN_PROGRESS").length} color="text-blue-600" />
        <StatCard icon={CheckCircle2} label="Resolved" value={complaints.filter((c) => c.status === "RESOLVED").length} color="text-emerald-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Complaints</CardTitle>
          <CardDescription>Update status as authorities act</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : complaints.length === 0 ? (
            <EmptyState emoji="🏛️" title="No complaints" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Upvotes</TableHead>
                    <TableHead>AI Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-[12rem]"><div className="truncate text-sm font-medium">{c.title}</div><div className="truncate text-[10px] text-muted-foreground">{c.description}</div></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{c.category}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.location}</TableCell>
                      <TableCell className="text-xs">{c.reporter?.name ?? "—"}</TableCell>
                      <TableCell className="tabular-nums">▲ {c.upvotes}</TableCell>
                      <TableCell className="text-xs">
                        {c.aiCategory ? (
                          <Badge variant="outline" className="gap-1 text-[10px]"><Eye className="h-2.5 w-2.5" />{c.aiCategory} ({Math.round((c.aiConfidence ?? 0) * 100)}%)</Badge>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-right">
                        <Select value={c.status} onValueChange={(v) => update(c.id, v)}>
                          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUBMITTED">SUBMITTED</SelectItem>
                            <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                            <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 13. Finance
// ============================================================================
function FinanceSection({ uid }: { uid: string }) {
  const { data: payData, loading: l1 } = useAdminData<{ payments: AdminPayment[]; stats: { totalRevenue: number; totalSuccessful: number; totalPending: number; totalRefunded: number } }>(`/api/admin/payments?uid=${uid}`);
  const { data: subData, loading: l2 } = useAdminData<{ subscriptions: AdminSubscription[] }>(`/api/admin/subscriptions?uid=${uid}`);

  const payments = payData?.payments ?? [];
  const stats = payData?.stats;
  const subs = subData?.subscriptions ?? [];

  return (
    <div className="space-y-4">
      <SectionHeader icon={Wallet} title="Finance" desc="Payments, revenue, and subscription plans" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Total Revenue" value={inr(stats?.totalRevenue ?? 0)} color="text-emerald-600" />
        <StatCard icon={CheckCircle2} label="Successful" value={stats?.totalSuccessful ?? 0} color="text-emerald-600" />
        <StatCard icon={Loader2} label="Pending" value={stats?.totalPending ?? 0} color="text-amber-600" />
        <StatCard icon={RotateCw} label="Refunded" value={stats?.totalRefunded ?? 0} color="text-orange-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payments</CardTitle>
          <CardDescription>All payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {l1 ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : payments.length === 0 ? (
            <EmptyState emoji="💳" title="No payments yet" />
          ) : (
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={p.user ?? { name: "—" }} size="h-6 w-6" />
                          <span className="text-xs">{p.user?.name ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{p.type}</Badge></TableCell>
                      <TableCell className="font-medium text-primary">{inr(p.amount)}</TableCell>
                      <TableCell className="text-xs">{p.gateway}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Subscription Plans</CardTitle>
          <CardDescription>Tiers available to users</CardDescription>
        </CardHeader>
        <CardContent>
          {l2 ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : subs.length === 0 ? (
            <EmptyState emoji="📦" title="No subscription plans" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subs.map((s) => (
                <div key={s.id} className={cn("rounded-lg border p-3", s.active ? "border-primary/30 bg-primary/5" : "opacity-60")}>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px]">{s.plan}</Badge>
                    {s.active ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-primary">{inr(s.price)}<span className="text-xs font-normal text-muted-foreground">/{s.billingCycle.toLowerCase()}</span></div>
                  <ul className="mt-2 space-y-1">
                    {((): string[] => { try { return JSON.parse(s.features); } catch { return []; } })().map((f, i) => (
                      <li key={i} className="flex items-start gap-1 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 14. Compliance
// ============================================================================
function ComplianceSection({ uid }: { uid: string }) {
  const { data, loading, reload } = useAdminData<{ reports: AdminReport[] }>(`/api/admin/reports?uid=${uid}`);
  const reports = data?.reports ?? [];

  async function act(id: string, status: string, action?: string) {
    try {
      await callAdmin(`/api/admin/reports/${id}?uid=${uid}`, { method: "PATCH", body: JSON.stringify({ status, action }) });
      toast.success(`Marked ${status}${action ? ` · ${action}` : ""}`);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const pending = reports.filter((r) => r.status === "PENDING" || r.status === "REVIEWING").length;
  const actioned = reports.filter((r) => r.status === "ACTIONED").length;
  const dismissed = reports.filter((r) => r.status === "DISMISSED").length;

  return (
    <div className="space-y-4">
      <SectionHeader icon={AlertTriangle} title="Compliance" desc="Abuse reports, content takedowns, suspensions" action={
        <Button size="sm" variant="outline" className="gap-1.5 tap-feedback" onClick={reload}><RotateCw className="h-3.5 w-3.5" /> Refresh</Button>
      } />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={AlertTriangle} label="Pending Reports" value={pending} color="text-amber-600" />
        <StatCard icon={CheckCircle2} label="Actioned" value={actioned} color="text-emerald-600" />
        <StatCard icon={XCircle} label="Dismissed" value={dismissed} color="text-slate-600" />
        <StatCard icon={Scale} label="Total Reports" value={reports.length} color="text-chart-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Abuse Reports</CardTitle>
          <CardDescription>Review reports and take action</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : reports.length === 0 ? (
            <EmptyState emoji="✅" title="No abuse reports" desc="Community is healthy!" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Handler</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{r.targetType}</Badge>
                        <div className="mt-0.5 text-[10px] text-muted-foreground truncate max-w-[10rem]">{r.targetId}</div>
                      </TableCell>
                      <TableCell className="max-w-[12rem]"><div className="truncate text-sm">{r.reason}</div>{r.description && <div className="line-clamp-1 text-[10px] text-muted-foreground">{r.description}</div>}</TableCell>
                      <TableCell className="text-xs">{r.reporter?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs">{r.handler?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {r.status === "PENDING" || r.status === "REVIEWING" ? (
                          <div className="flex flex-wrap justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => act(r.id, "DISMISSED")}>Dismiss</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-600 tap-feedback" onClick={() => act(r.id, "REVIEWING")}>Review</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive tap-feedback" onClick={() => act(r.id, "ACTIONED", "CONTENT_REMOVED")}>Takedown</Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">{r.action !== "NONE" ? r.action : "—"}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 15. Support
// ============================================================================
function SupportSection({ uid }: { uid: string }) {
  const { data, loading, reload } = useAdminData<{ tickets: AdminTicket[] }>(`/api/admin/tickets?uid=${uid}`);
  const tickets = data?.tickets ?? [];

  async function patch(t: AdminTicket, payload: Record<string, unknown>) {
    try {
      await callAdmin(`/api/admin/tickets/${t.id}?uid=${uid}`, { method: "PATCH", body: JSON.stringify(payload) });
      toast.success("Ticket updated");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const open = tickets.filter((t) => t.status === "OPEN").length;
  const inProg = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolved = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="space-y-4">
      <SectionHeader icon={HeadphonesIcon} title="Support" desc="Handle user support tickets" action={
        <Button size="sm" variant="outline" className="gap-1.5 tap-feedback" onClick={reload}><RotateCw className="h-3.5 w-3.5" /> Refresh</Button>
      } />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={AlertTriangle} label="Open" value={open} color="text-amber-600" />
        <StatCard icon={Loader2} label="In Progress" value={inProg} color="text-blue-600" />
        <StatCard icon={CheckCircle2} label="Resolved" value={resolved} color="text-emerald-600" />
        <StatCard icon={HeadphonesIcon} label="Total Tickets" value={tickets.length} color="text-chart-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Support Tickets</CardTitle>
          <CardDescription>Assign, resolve, or close tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
          ) : tickets.length === 0 ? (
            <EmptyState emoji="🎧" title="No support tickets" />
          ) : (
            <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="max-w-[12rem]"><div className="truncate text-sm font-medium">{t.subject}</div><div className="line-clamp-1 text-[10px] text-muted-foreground">{t.description}</div></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{t.type}</Badge></TableCell>
                      <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                      <TableCell className="text-xs">{t.requester?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs">{t.assignee?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {t.status !== "RESOLVED" && t.status !== "CLOSED" && (
                            <>
                              {!t.assigneeId && (
                                <Button size="sm" variant="ghost" className="h-7 text-xs tap-feedback" onClick={() => patch(t, { assigneeId: uid, status: "IN_PROGRESS" })}>
                                  Assign me
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 tap-feedback" onClick={() => patch(t, { status: "RESOLVED" })}>
                                Resolve
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground tap-feedback" onClick={() => patch(t, { status: "CLOSED" })}>
                                Close
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 16. Settings
// ============================================================================
function SettingsSection({ uid }: { uid: string }) {
  const [sub, setSub] = React.useState<"locations" | "categories" | "cms" | "roles">("roles");

  return (
    <div className="space-y-4">
      <SectionHeader icon={SettingsIcon} title="Settings" desc="Locations, categories, CMS, roles & permissions" />

      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {([
          { k: "roles", label: "Roles & Permissions", icon: KeyRound },
          { k: "locations", label: "Locations", icon: TreePine },
          { k: "categories", label: "Categories", icon: Tag },
          { k: "cms", label: "CMS Pages", icon: FileText },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.k}
              onClick={() => setSub(t.k)}
              className={cn(
                "tap-feedback flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                sub === t.k ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {sub === "roles" && <RolesMatrix uid={uid} />}
      {sub === "locations" && <LocationsMaster uid={uid} />}
      {sub === "categories" && <CategoriesMaster uid={uid} />}
      {sub === "cms" && <CmsPages uid={uid} />}
    </div>
  );
}

function RolesMatrix({ uid }: { uid: string }) {
  const { data, loading } = useAdminData<{ roles: AdminRole[] }>(`/api/admin/roles-matrix?uid=${uid}`);
  const roles = data?.roles ?? [];
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Roles & Permissions Matrix</CardTitle>
        <CardDescription>18 roles (8 user + 10 admin) with their permission grants</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
        ) : roles.length === 0 ? (
          <EmptyState emoji="🔑" title="No roles found" />
        ) : (
          <div className="max-h-[36rem] space-y-1.5 overflow-y-auto scrollbar-thin">
            {roles.map((r) => {
              const isOpen = expanded === r.id;
              return (
                <div key={r.id} className="rounded-lg border">
                  <button
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                    className="tap-feedback flex w-full items-center gap-3 p-3 text-left"
                  >
                    <span className="text-xl">{r.meta?.emoji ?? "👤"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{r.name}</span>
                        <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                        {r.isSystem && <Badge variant="secondary" className="text-[10px]">system</Badge>}
                      </div>
                      <div className="truncate text-[10px] text-muted-foreground">{r.description}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">L{r.level}</span>
                      <span className="tabular-nums">{r.permissionCount} perms</span>
                      <span className="tabular-nums">{r.userCount} users</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t p-3">
                      <div className="mb-2 text-xs font-medium text-muted-foreground">Granted permissions ({r.permissions.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {r.permissions.map((p) => (
                          <Badge key={p.code} variant="outline" className="gap-1 px-1.5 py-0 text-[10px]">
                            <span className="text-muted-foreground">{p.module}:</span>{p.code}
                          </Badge>
                        ))}
                        {r.permissions.length === 0 && <span className="text-xs text-muted-foreground">No permissions granted.</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LocationsMaster({ uid }: { uid: string }) {
  const { data, loading } = useAdminData<{ grouped: Record<string, { id: string; name: string; level: string; active: boolean; parentId?: string | null }[]> }>(`/api/admin/locations?uid=${uid}`);
  const grouped = data?.grouped ?? {};
  const levels: { key: string; label: string; emoji: string }[] = [
    { key: "COUNTRY", label: "Countries", emoji: "🌍" },
    { key: "STATE", label: "States", emoji: "🗺️" },
    { key: "CITY", label: "Cities", emoji: "🏙️" },
    { key: "AREA", label: "Areas", emoji: "📍" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {levels.map((l) => {
        const items = grouped[l.key] ?? [];
        return (
          <Card key={l.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm">{l.emoji} {l.label}</CardTitle>
              <CardDescription>{items.length} entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-1.5">{[1, 2, 3].map((i) => <div key={i} className="h-6 animate-pulse rounded bg-muted/40" />)}</div>
              ) : items.length === 0 ? (
                <div className="py-3 text-center text-xs text-muted-foreground">No {l.label.toLowerCase()} seeded</div>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto scrollbar-thin">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
                      <span>{it.name}</span>
                      {it.active ? <Check className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CategoriesMaster({ uid }: { uid: string }) {
  const { data, loading } = useAdminData<{ grouped: Record<string, { id: string; name: string; module: string; icon?: string | null; active: boolean }[]> }>(`/api/admin/categories?uid=${uid}`);
  const grouped = data?.grouped ?? {};
  const modules = Object.keys(grouped).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Category Master</CardTitle>
        <CardDescription>Categories grouped by module</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}</div>
        ) : modules.length === 0 ? (
          <EmptyState emoji="🏷️" title="No categories seeded" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div key={m} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{m}</Badge>
                  <span className="text-[10px] text-muted-foreground">{grouped[m].length} cats</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {grouped[m].map((c) => (
                    <Badge key={c.id} variant="secondary" className="text-[10px]">{c.icon ? `${c.icon} ` : ""}{c.name}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CmsPages({ uid }: { uid: string }) {
  const { data, loading } = useAdminData<{ pages: { id: string; slug: string; title: string; type: string; published: boolean; updatedAt: string }[] }>(`/api/admin/cms?uid=${uid}`);
  const pages = data?.pages ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">CMS Pages</CardTitle>
        <CardDescription>Static pages, blog posts, FAQs</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/40" />)}</div>
        ) : pages.length === 0 ? (
          <EmptyState emoji="📄" title="No CMS pages" />
        ) : (
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm font-medium">{p.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">/{p.slug}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.type}</Badge></TableCell>
                    <TableCell>{p.published ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeAgo(p.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
