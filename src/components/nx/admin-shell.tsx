"use client";

/**
 * AdminShell — the separate Admin Console.
 * ====================================================================
 * Completely distinct from the user app shell:
 *  - Own header (branded dark bar with "Admin Console" title, admin role
 *    badge, "Back to App" button, user avatar)
 *  - Own sidebar (role-scoped admin modules — Super Admin sees all 16,
 *    Society Admin sees only society modules, etc.)
 *  - Own main content area (renders AdminPanelContent for the active tab)
 *
 * Accessed via the "Admin Console" button in the user Header (visible only
 * to admin-role users). The view switch is controlled by `adminView` in the
 * NX store — no route change, everything stays on `/`.
 */

import * as React from "react";
import { useNX } from "@/lib/store";
import { useIam } from "@/lib/iam/use-iam";
import { getVisibleAdminTabs, getAdminRoleLabel } from "@/lib/iam/admin-modules";
import { ADMIN_TABS, AdminPanelContent, type AdminTabKey } from "./modules/admin-panel";
import { Logo } from "./logo";
import { UserAvatar } from "./user-bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Crown, ShieldCheck, Menu, Moon, Sun, LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Sheet, SheetContent, SheetTrigger,
} from "@/components/ui/sheet";
import type { User } from "@/lib/types";

export function AdminShell({ user }: { user: User }) {
  const iam = useIam();
  const setAdminView = useNX((s) => s.setAdminView);
  const [activeTab, setActiveTab] = React.useState<AdminTabKey>("overview");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Role-scope the visible tabs
  const visibleTabs = React.useMemo(() => {
    const allowedKeys = getVisibleAdminTabs(iam.roles);
    return ADMIN_TABS.filter((t) => allowedKeys.includes(t.key));
  }, [iam.roles]);

  const roleLabel = getAdminRoleLabel(iam.roles);

  const handleLogout = React.useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      setTimeout(() => window.location.reload(), 600);
    } catch {
      toast.error("Logout failed — please try again.");
      setLoggingOut(false);
    }
  }, [loggingOut]);

  const handleBackToApp = () => {
    setAdminView(false);
  };

  return (
    <div className="flex min-h-screen-dvh flex-col bg-muted/30 dark:bg-background">
      {/* ── Admin Header — branded dark bar, distinct from user header ── */}
      <header className="sticky top-0 z-40 border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-950 via-slate-950 to-emerald-950 text-white pt-safe">
        <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:px-4">
          {/* Mobile: hamburger for admin sidebar */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-fuchsia-500/20 p-0">
              <div className="flex h-full flex-col">
                <div className="border-b border-fuchsia-500/20 p-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-fuchsia-500/20">
                      <Crown className="h-4 w-4 text-fuchsia-400" />
                    </div>
                    <div className="text-sm font-bold">Admin Console</div>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-3">
                  <AdminSidebar
                    tabs={visibleTabs}
                    activeTab={activeTab}
                    onSelect={(k) => { setActiveTab(k); setMobileOpen(false); }}
                  />
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo + Admin Console title */}
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 backdrop-blur">
              <Crown className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div className="leading-none">
              <div className="text-sm font-bold sm:text-base">
                Admin Console
              </div>
              <div className="hidden text-[10px] text-white/60 sm:block">
                NeighborX Control Center
              </div>
            </div>
          </div>

          {/* Role badge */}
          <Badge className="ml-2 gap-1 bg-fuchsia-500/20 text-fuchsia-200 hover:bg-fuchsia-500/30">
            <ShieldCheck className="h-3 w-3" />
            {roleLabel}
            {iam.isSuperAdmin && <span className="ml-0.5">L{iam.level}</span>}
          </Badge>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {/* Back to App */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToApp}
              className="gap-1.5 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to App</span>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-white hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* User avatar + logout */}
            <div className="flex items-center gap-2">
              <UserAvatar user={user} />
              <div className="hidden text-left leading-tight sm:block">
                <div className="max-w-[100px] truncate text-xs font-semibold">{user.name}</div>
                <div className="text-[10px] text-white/60">{user.email}</div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-white hover:bg-white/10"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Body: admin sidebar + main content ── */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {/* Desktop admin sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 self-start overflow-hidden border-r bg-background lg:block lg:top-16 lg:h-[calc(100dvh-4rem)]">
          <ScrollArea className="h-full p-3">
            <div className="mb-3 px-2 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Modules ({visibleTabs.length})
              </div>
            </div>
            <AdminSidebar
              tabs={visibleTabs}
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:pb-8">
            <React.Suspense
              fallback={<div className="h-40 animate-pulse rounded-lg bg-muted/40" />}
            >
              <div key={activeTab} className="animate-fade-in-up">
                <AdminPanelContent activeTab={activeTab} uid={user.id} />
              </div>
            </React.Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Admin sidebar — role-scoped list of admin modules.
 * Extracted as a separate component to satisfy react-hooks/static-components
 * lint rule (no components defined inside other components' render).
 */
function AdminSidebar({ tabs, activeTab, onSelect }: {
  tabs: typeof ADMIN_TABS;
  activeTab: AdminTabKey;
  onSelect: (k: AdminTabKey) => void;
}) {
  return (
    <nav className="space-y-1">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            className={cn(
              "tap-feedback flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
              isActive
                ? "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-fuchsia-600 dark:text-fuchsia-400")} />
            <span className="truncate">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
