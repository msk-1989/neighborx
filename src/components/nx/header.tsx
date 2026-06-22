"use client";

import * as React from "react";
import { useNX } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Menu, Moon, Sun, MapPin, ChevronDown, Globe2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Sidebar } from "./sidebar";
import { UserAvatar, VerifyBadges } from "./user-bits";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Notification, User } from "@/lib/types";
import { timeAgo } from "@/lib/types";
import { toast } from "sonner";

const SCOPES = [
  { key: "SOCIETY", label: "My Society", range: "0–500m" },
  { key: "AREA", label: "My Area", range: "0–2km" },
  { key: "CITY", label: "City", range: "Entire city" },
] as const;

export function Header({ user }: { user: User }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const nb = useNX((s) => s.neighborhood);
  const setScope = useNX((s) => s.setScope);
  const setModule = useNX((s) => s.setModule);
  const [notifs, setNotifs] = React.useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const loadNotifs = React.useCallback(async () => {
    try {
      const n = await api<Notification[]>(`/api/notifications?uid=${user.id}`);
      setNotifs(n);
    } catch {}
  }, [user.id]);

  React.useEffect(() => {
    loadNotifs();
    const t = setInterval(loadNotifs, 15000);
    return () => clearInterval(t);
  }, [loadNotifs]);

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 border-b glass">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-4">
        {/* mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* neighborhood + scope */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 gap-1.5 px-2 sm:px-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                  {nb.society}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Location
                  </div>
                  <div className="mt-1 text-sm font-semibold">{nb.society}</div>
                  <div className="text-xs text-muted-foreground">
                    {nb.area}, {nb.city}, {nb.district}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {nb.state}, India
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Visibility Scope
                  </div>
                  <div className="space-y-1">
                    {SCOPES.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => {
                          setScope(s.key);
                          toast.success(`Scope: ${s.label} (${s.range})`);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                          nb.scope === s.key
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Globe2 className="h-3.5 w-3.5" />
                          {s.label}
                        </span>
                        <span className="text-[11px] opacity-70">{s.range}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* scope chips */}
          <div className="hidden md:flex items-center gap-1">
            {SCOPES.map((s) => (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  nb.scope === s.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* notifications */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b px-3 py-2.5">
                <div className="text-sm font-semibold">Notifications</div>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                {notifs.length === 0 && (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className="border-b px-3 py-2.5 last:border-0 hover:bg-accent/50"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          n.type === "EMERGENCY"
                            ? "bg-destructive"
                            : n.type === "MARKETPLACE"
                            ? "bg-chart-2"
                            : n.type === "SOCIAL"
                            ? "bg-chart-1"
                            : "bg-muted-foreground"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {n.body}
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* theme */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* user */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-accent transition-colors">
                <UserAvatar user={user} />
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-sm font-semibold max-w-[120px] truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {user.role.replace(/_/g, " ")}
                  </div>
                </div>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{user.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <VerifyBadges user={user} size="xs" />
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                      ⭐ {user.rewardPoints} pts
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setModule("profile")}>
                My Profile & Verification
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModule("assistant")}>
                Ask AI Assistant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModule("chat")}>
                Community Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info("Signed in as demo user")}>
                Switch demo user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
