"use client";

import * as React from "react";
import { useNX } from "@/lib/store";
import { MODULES, GROUP_LABELS, GROUP_ORDER } from "./modules-config";
import type { ModuleDef, ModuleKey } from "./modules-config";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LayoutDashboard, Newspaper, Siren, Grid3x3, Clapperboard } from "lucide-react";

/**
 * Bottom tab bar — visible only on mobile/tablet (below lg).
 * Native app feel: 4 flat tabs + 1 elevated center SOS button.
 * Primary tabs: Home, Feed, Reels + center SOS.
 * The "More" tab opens a bottom sheet with the full module grid (incl. Groups).
 */

const PRIMARY_TABS: { key: ModuleKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard },
  { key: "feed", label: "Feed", icon: Newspaper },
  { key: "reels", label: "Reels", icon: Clapperboard },
];

export function MobileTabBar() {
  const active = useNX((s) => s.activeModule);
  const setModule = useNX((s) => s.setModule);
  const [moreOpen, setMoreOpen] = React.useState(false);

  const go = (key: ModuleKey) => {
    setModule(key);
    setMoreOpen(false);
  };

  const isActive = (key: ModuleKey) => active === key;

  return (
    <>
      {/* Bottom tab bar — fixed, safe-area aware */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      >
        <div className="glass relative border-t bg-card/95 pb-safe">
          <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
            {/* Left: Home + Feed */}
            {PRIMARY_TABS.slice(0, 2).map((t) => (
              <TabButton
                key={t.key}
                label={t.label}
                active={isActive(t.key)}
                onClick={() => go(t.key)}
                Icon={t.icon}
              />
            ))}

            {/* Center: elevated SOS */}
            <div className="flex w-16 shrink-0 items-start justify-center">
              <button
                onClick={() => go("emergency")}
                aria-label="Emergency SOS"
                aria-current={isActive("emergency") ? "page" : undefined}
                className={cn(
                  "tap-feedback -mt-5 grid h-14 w-14 place-items-center rounded-full border-4 border-card shadow-lg transition-transform",
                  "bg-destructive text-destructive-foreground",
                  isActive("emergency") && "scale-105"
                )}
              >
                <Siren className="h-6 w-6" />
                <span className="absolute -bottom-0.5 right-0 h-3 w-3">
                  <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-60" />
                  <span className="absolute inset-0 rounded-full bg-destructive" />
                </span>
              </button>
            </div>

            {/* Right: Market + More */}
            {PRIMARY_TABS.slice(2).map((t) => (
              <TabButton
                key={t.key}
                label={t.label}
                active={isActive(t.key)}
                onClick={() => go(t.key)}
                Icon={t.icon}
              />
            ))}
            <TabButton
              label="More"
              active={moreOpen || !PRIMARY_TABS.some((t) => t.key === active) && active !== "emergency"}
              onClick={() => setMoreOpen(true)}
              Icon={Grid3x3}
            />
          </div>
        </div>
      </nav>

      {/* More sheet — bottom sheet with all modules grouped */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-2xl p-0 pb-safe"
        >
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="text-left">All Modules</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {GROUP_ORDER.map((group) => {
              const items = MODULES.filter((m) => m.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group === "home" ? "Overview" : GROUP_LABELS[group]}
                    </div>
                    {group === "coming-soon" && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400">
                        Roadmap
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {items.map((m) => {
                      const Icon = m.icon;
                      const isOn = active === m.key;
                      return (
                        <button
                          key={m.key}
                          onClick={() => go(m.key)}
                          className={cn(
                            "tap-feedback relative flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center transition-colors",
                            isOn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/60 text-foreground hover:bg-muted",
                            m.comingSoon && !isOn && "opacity-60"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-[10px] font-medium leading-tight">
                            {m.label}
                          </span>
                          {m.comingSoon && (
                            <span className={cn(
                              "absolute right-1 top-1 rounded px-1 py-0.5 text-[7px] font-bold uppercase leading-none",
                              isOn ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            )}>
                              P{m.phase}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function TabButton({
  label,
  active,
  onClick,
  Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "tap-feedback flex flex-1 flex-col items-center justify-center gap-0.5 pt-2",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", active && "stroke-[2.4]")} />
      <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
        {label}
      </span>
    </button>
  );
}
