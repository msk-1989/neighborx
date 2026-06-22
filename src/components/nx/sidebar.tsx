"use client";

import { useNX } from "@/lib/store";
import { MODULES, GROUP_LABELS } from "./modules-config";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "./logo";
import type { ModuleDef } from "./modules-config";
import { ShieldCheck } from "lucide-react";

const GROUP_ORDER: ModuleDef["group"][] = [
  "home",
  "community",
  "commerce",
  "civic",
  "ai",
  "you",
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const active = useNX((s) => s.activeModule);
  const setModule = useNX((s) => s.setModule);
  const nb = useNX((s) => s.neighborhood);

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-4 border-b">
        <Logo />
      </div>

      <div className="px-4 py-3 border-b bg-muted/40">
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
                {group !== "home" && (
                  <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {GROUP_LABELS[group]}
                  </div>
                )}
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
                          "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-accent text-foreground/80 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 font-medium">{m.label}</span>
                        {m.key === "emergency" && (
                          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
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
            Community · Commerce · Civic — all in one trusted place.
          </div>
        </div>
      </div>
    </div>
  );
}
