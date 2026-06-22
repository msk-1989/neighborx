import { Logo } from "./logo";
import { Heart, ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              The Digital Operating System for Every Neighborhood in India.
              Verified communities, local commerce, jobs, services, and a civic
              safety network — all in one trusted super app.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Platform</div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>Community Feed</li>
              <li>Marketplace</li>
              <li>Jobs & Services</li>
              <li>Emergency SOS</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Why NeighborX</div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified neighbors
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" /> Hyperlocal & realtime
              </li>
              <li className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-primary" /> Trusted & inclusive
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} NeighborX · Made for India 🇮🇳</div>
          <div>Udgir · Latur · Maharashtra</div>
        </div>
      </div>
    </footer>
  );
}
