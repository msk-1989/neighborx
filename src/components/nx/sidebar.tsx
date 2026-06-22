"use client";

import { useNX } from "@/lib/store";
import { MODULES, GROUP_LABELS, GROUP_ORDER, PHASE_LABELS } from "./modules-config";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "./logo";
import type { ModuleDef } from "./modules-config";
import { ShieldCheck } from "lucide-react";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const active = useNX((s) => s.activeModule);
  const setModule = useNX((s) => s.setModule);
  const nb = useNX((s) => s.neighborhood);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <Logo />
      </div>

      <div className="border-b bg-muted/40 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Your Neighborhood
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {nb.society}
        </div>
        <div className="text-xs text-muted-foreground">
          {nb.area}, {nb.city}
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-4">
          {GROUP_ORDER.map((group) => {
            const items = MODULES.filter((m) => m.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <div className="flex items-center justify-between px-2 pb-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {GROUP_LABELS[group]}
                  </div>
                  {group === "coming-soon" && (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400">
                      Roadmap
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {items.map((m) => {
                    const Icon = m.icon;
                    const isActive = active === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => {
                          setModule(m.key);
                          onNavigate?.();
                        }}
                        className={cn(
                          "tap-feedback group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-accent text-foreground/80 hover:text-foreground",
                          m.comingSoon && !isActive && "opacity-70"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 font-medium">{m.label}</span>
                        {m.key === "emergency" && (
                          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        )}
                        {m.comingSoon && (
                          <span className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                            isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
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
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="rounded-lg brand-gradient-soft p-3 text-xs">
          <div className="font-semibold text-foreground">The Digital OS for Every Neighborhood</div>
          <div className="mt-1 text-muted-foreground">
            Community · Trust · Safety — first. Commerce follows.
          </div>
        </div>
      </div>
    </div>
  );
}
