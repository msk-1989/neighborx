"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Bell } from "lucide-react";
import { useNX } from "@/lib/store";
import { toast } from "sonner";

interface ComingSoonProps {
  title: string;
  description: string;
  phase: number;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

export function ComingSoon({ title, description, phase, icon: Icon, features }: ComingSoonProps) {
  const setModule = useNX((s) => s.setModule);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="overflow-hidden">
        <div className="brand-gradient relative p-6 text-center text-white sm:p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur sm:h-20 sm:w-20">
            <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <Badge className="mt-4 bg-white/20 text-white hover:bg-white/30">
            <Rocket className="mr-1 h-3 w-3" /> Phase {phase} · Coming Soon
          </Badge>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">{title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/90 sm:text-base">
            {description}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-3 text-sm font-semibold text-muted-foreground">
            What you'll be able to do:
          </div>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <span className="text-[10px] font-bold">{i + 1}</span>
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-2 border-t pt-4 sm:flex-row">
            <Button
              className="tap-feedback w-full gap-2 sm:w-auto"
              onClick={() => toast.success("We'll notify you when " + title + " launches! 🚀")}
            >
              <Bell className="h-4 w-4" /> Notify me at launch
            </Button>
            <Button
              variant="outline"
              className="tap-feedback w-full sm:w-auto"
              onClick={() => setModule("dashboard")}
            >
              Back to Home
            </Button>
          </div>

          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
            NeighborX follows a phased launch — <span className="font-semibold">community density first</span>, then commerce.
            This module ships in Phase {phase}.
          </div>
        </div>
      </Card>
    </div>
  );
}
