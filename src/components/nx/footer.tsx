import { Logo } from "./logo";
import {
  Heart,
  ShieldCheck,
  Zap,
  MapPin,
  Github,
  Twitter,
  Send,
  Compass,
  BookOpen,
  Clapperboard,
  Layers,
} from "lucide-react";

/**
 * Footer — the marketing footer for the public landing page only.
 * NOT rendered inside the app panel or admin console (those are
 * full-height app-like experiences — see app-shell.tsx / admin-shell.tsx).
 *
 * Layout: 12-col grid on lg, brand column spans 5, three link columns
 * span 7 together. Bottom bar has a divider + copyright + location row.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/70 bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand block — spans full width on mobile, 5 cols on lg */}
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The Neighborhood Operating System for India. A local search engine,
              hyperlocal yellow pages, trusted commerce network, and community
              safety net — 16 pillars, one verified app, society-first.
            </p>
            {/* Social row */}
            <div className="mt-5 flex items-center gap-2">
              {[
                { Icon: Send, label: "Telegram" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Github, label: "GitHub" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="tap-feedback grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns — span 7 cols together on lg, 2 cols on sm */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {/* Platform — the 16 pillars */}
              <nav aria-label="Platform">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Platform
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    { label: "Neighborhood Search", Icon: Compass },
                    { label: "Yellow Pages", Icon: BookOpen },
                    { label: "Hyperlocal Reels", Icon: Clapperboard },
                    { label: "Marketplace", Icon: Layers },
                  ].map(({ label, Icon }) => (
                    <li key={label}>
                      <a
                        href="#pillars"
                        className="tap-feedback flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Why NeighborX */}
              <nav aria-label="Why NeighborX">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Why NeighborX
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                    <span>Verified neighbors</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 shrink-0 text-primary" />
                    <span>Hyperlocal &amp; realtime</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4 shrink-0 text-primary" />
                    <span>Society-first, not global</span>
                  </li>
                </ul>
              </nav>

              {/* Reach us */}
              <nav aria-label="Reach us" className="col-span-2 sm:col-span-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Reach us
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Udgir &middot; Latur
                      <br />
                      Maharashtra, India
                    </span>
                  </li>
                  <li>
                    <a
                      href="mailto:hello@neighborx.in"
                      className="tap-feedback transition-colors hover:text-primary"
                    >
                      hello@neighborx.in
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-1.5">
            <span>
              &copy; {year} NeighborX &middot; Made for India
            </span>
            <span aria-hidden className="text-base leading-none">
              🇮🇳
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="tap-feedback transition-colors hover:text-primary">
              Privacy
            </a>
            <a href="#" className="tap-feedback transition-colors hover:text-primary">
              Terms
            </a>
            <span className="text-muted-foreground/60">v4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
