"use client";

import * as React from "react";
import { Logo } from "./logo";
import { Footer } from "./footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Heart,
  Users,
  Store,
  Wrench,
  Briefcase,
  Siren,
  ShoppingBag,
  MessagesSquare,
  Newspaper,
  CalendarDays,
  Trophy,
  Search,
  UserRound,
  MapPin,
  Star,
  Quote,
  Check,
  Menu,
  X,
  Phone,
  Mail,
  Lock,
  Globe2,
  TrendingUp,
  HandHeart,
  Building2,
  Car,
  GraduationCap,
  PackageOpen,
  Crown,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-you", label: "For You" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const TRUST_STATS = [
  { value: "12K+", label: "Verified neighbors" },
  { value: "850+", label: "Local businesses" },
  { value: "120+", label: "Societies onboarded" },
  { value: "15+", label: "Cities across India" },
];

const FEATURES = [
  {
    icon: Newspaper,
    title: "Community Feed",
    desc: "Hyperlocal posts, updates, recommendations, polls, and events — scoped to your society, area, or city.",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: MessagesSquare,
    title: "Real-time Chat",
    desc: "Society-wide and area-wide chat rooms with presence indicators. Connect with neighbors instantly.",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-950/30",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    desc: "Buy and sell within your trusted neighborhood. Electronics, furniture, vehicles — all local, all verified.",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Wrench,
    title: "Services",
    desc: "Book plumbers, electricians, tutors, cooks, and more — reviewed by neighbors you trust.",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: Briefcase,
    title: "Local Jobs",
    desc: "Find jobs near you or hire locally. Full-time, part-time, gig — all within your community.",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: Siren,
    title: "Emergency SOS",
    desc: "One-tap SOS broadcasts your location to nearby neighbors and alerts — real help, real fast.",
    color: "text-red-600 bg-red-50 dark:bg-red-950/30",
  },
  {
    icon: ShieldCheck,
    title: "Neighborhood Watch",
    desc: "Crowdsourced safety alerts for scams, thefts, and suspicious activity. Stay informed, stay safe.",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    icon: Store,
    title: "Verified Businesses",
    desc: "Discover and review local businesses — from kirana stores to clinics — with trust badges.",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-950/30",
  },
  {
    icon: Trophy,
    title: "Reputation & Rewards",
    desc: "Earn reward points, climb trust tiers (Bronze → Legend), and unlock Community Hero status.",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30",
  },
  {
    icon: CalendarDays,
    title: "Events & Gatherings",
    desc: "Discover and RSVP to community events — festivals, cleanups, sports, meetups, and more.",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-950/30",
  },
  {
    icon: Search,
    title: "Lost & Found",
    desc: "Lost a pet, wallet, or document? Post it hyperlocally and let neighbors help you find it.",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    icon: UserRound,
    title: "5-Level Verification",
    desc: "Mobile, email, Aadhaar, address, and business verification — build trust, unlock features.",
    color: "text-green-600 bg-green-50 dark:bg-green-950/30",
  },
];

const ROADMAP_FEATURES = [
  { icon: Building2, label: "Property & Rentals", phase: "Phase 3" },
  { icon: Users, label: "Society Management", phase: "Phase 3" },
  { icon: HandHeart, label: "Fundraising", phase: "Phase 4" },
  { icon: Car, label: "Carpool & Mobility", phase: "Phase 4" },
  { icon: GraduationCap, label: "Skill Exchange", phase: "Phase 4" },
  { icon: PackageOpen, label: "Hyperlocal Commerce", phase: "Phase 4" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Register with OTP",
    desc: "Sign up in 30 seconds with your email and phone. No passwords — just a secure 6-digit OTP.",
    icon: Lock,
  },
  {
    step: "02",
    title: "Verify your identity",
    desc: "Complete 5-level verification (mobile, email, Aadhaar, address, business) to unlock trust features.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Connect & thrive",
    desc: "Join your neighborhood feed, chat, marketplace, and more. Build trust, earn rewards, help neighbors.",
    icon: Heart,
  },
];

const ROLE_SECTIONS = [
  {
    icon: Users,
    title: "For Residents",
    tagline: "Live better, together",
    color: "from-emerald-500 to-teal-600",
    points: [
      "Connect with verified neighbors in your society and area",
      "Get real-time safety alerts and emergency SOS",
      "Buy, sell, and borrow within a trusted community",
      "Find local services, jobs, and events near you",
      "Earn rewards and climb the Community Hero leaderboard",
    ],
  },
  {
    icon: Store,
    title: "For Businesses",
    tagline: "Grow locally, trusted",
    color: "from-amber-500 to-orange-600",
    points: [
      "List your business with verified badges for trust",
      "Reach hyperlocal customers in your area",
      "Collect reviews and build your reputation",
      "Boost listings and run targeted promotions",
      "Track engagement with Business Pro analytics",
    ],
  },
  {
    icon: Wrench,
    title: "For Service Providers",
    tagline: "Get booked, get paid",
    color: "from-purple-500 to-fuchsia-600",
    points: [
      "Offer plumbing, tutoring, cleaning, and more",
      "Get verified and stand out with trust badges",
      "Receive bookings and manage availability",
      "Build a 5-star reputation with neighbor reviews",
      "Grow your client base hyperlocally",
    ],
  },
  {
    icon: Briefcase,
    title: "For Employers",
    tagline: "Hire locally, faster",
    color: "from-rose-500 to-pink-600",
    points: [
      "Post jobs and reach local talent instantly",
      "Filter by verification level for trusted hires",
      "Manage applications and shortlist candidates",
      "Hire for full-time, part-time, or gig roles",
      "Build your employer brand in the community",
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Kulkarni",
    role: "Society Admin · Royal Residency, Udgir",
    avatar: "PK",
    color: "bg-emerald-500",
    quote:
      "NeighborX transformed how our society communicates. Visitor management, notices, chat — everything in one place. We finally feel connected.",
    rating: 5,
  },
  {
    name: "Ravi Shinde",
    role: "Business Owner · Shinde Kirana",
    avatar: "RS",
    color: "bg-amber-500",
    quote:
      "I get 3-4 new customers every week from my NeighborX listing. The verified badge built trust instantly. Best decision for my shop.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    role: "Tutor · Latur",
    avatar: "AD",
    color: "bg-purple-500",
    quote:
      "As a service provider, I went from 5 students to 22 in 3 months. The booking system and reviews made it so easy to grow.",
    rating: 5,
  },
  {
    name: "Vijay More",
    role: "Resident · Khair Nagar",
    avatar: "VM",
    color: "bg-sky-500",
    quote:
      "I lost my wallet near the temple. Posted on NeighborX Lost & Found — found it within 2 hours thanks to a neighbor. This is what community means.",
    rating: 5,
  },
  {
    name: "Mahesh Jadhav",
    role: "Employer · Industrial Estate",
    avatar: "MJ",
    color: "bg-rose-500",
    quote:
      "Hired 4 local workers through NeighborX in a week. The verification badges gave me confidence. No more unreliable referrals.",
    rating: 5,
  },
  {
    name: "Sneha Patil",
    role: "Service Provider · Udgir",
    avatar: "SP",
    color: "bg-teal-500",
    quote:
      "The reputation system is motivating. I climbed from Bronze to Gold in 6 months just by doing good work and helping neighbors.",
    rating: 5,
  },
];

const PRICING = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "For every neighbor",
    icon: Heart,
    color: "border-border",
    cta: "Get started",
    highlight: false,
    features: [
      "Community feed, chat & groups",
      "Marketplace (buy & sell)",
      "Emergency SOS & safety alerts",
      "5-level verification",
      "Reputation & rewards",
      "Up to 3 listings per month",
    ],
  },
  {
    name: "Business Pro",
    price: "₹499",
    period: "/month",
    desc: "For local businesses",
    icon: Store,
    color: "border-primary ring-2 ring-primary/20",
    cta: "Start free trial",
    highlight: true,
    features: [
      "Everything in Free",
      "Verified business badge",
      "Unlimited listings + boost",
      "Analytics dashboard",
      "Promoted in neighborhood feed",
      "Priority customer support",
    ],
  },
  {
    name: "Service Pro",
    price: "₹299",
    period: "/month",
    desc: "For service providers",
    icon: Wrench,
    color: "border-border",
    cta: "Start free trial",
    highlight: false,
    features: [
      "Everything in Free",
      "Verified provider badge",
      "Online booking calendar",
      "Customer review management",
      "Featured in service search",
      "Income tracking dashboard",
    ],
  },
];

const FAQS = [
  {
    q: "Is NeighborX free to use?",
    a: "Yes! The core app — community feed, chat, marketplace, emergency SOS, verification, and reputation — is completely free for every neighbor. We offer optional Pro plans for businesses and service providers who want advanced features.",
  },
  {
    q: "How does verification work?",
    a: "We use a 5-level verification system: (1) Mobile via OTP, (2) Email via link, (3) Aadhaar via OTP, (4) Address via document upload, (5) Business via GST/license. Each level unlocks new features and builds your trust score.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. Your personal data is encrypted, never sold, and only visible to verified neighbors in your community. You control what's visible on your profile. We're compliant with India's DPDP Act.",
  },
  {
    q: "Which cities is NeighborX available in?",
    a: "We're currently live in 15+ cities across Maharashtra, Karnataka, and Telangana — including Udgir, Latur, Solapur, Kalaburagi, and Hyderabad. New cities are added every month. Request your city if it's not listed!",
  },
  {
    q: "How is NeighborX different from WhatsApp groups?",
    a: "WhatsApp groups are chaotic, unverified, and lack structure. NeighborX offers verified identities, scoped feeds (society/area/city), built-in marketplace, services, jobs, emergency SOS, reputation system, and 10-level admin moderation — all in one trusted app.",
  },
  {
    q: "Can I use NeighborX for my society?",
    a: "Yes! We have a dedicated Society Admin role with tools for visitor management, notices, maintenance tracking, facility booking, and polls. Contact us to onboard your society and get a Society Pro plan.",
  },
  {
    q: "What is the Community Hero program?",
    a: "Community Heroes are neighbors who actively contribute — helping others, posting alerts, volunteering. You earn reward points, climb tiers (Bronze → Silver → Gold → Platinum → Legend), and get recognized with badges and perks.",
  },
  {
    q: "How do Emergency SOS alerts work?",
    a: "When you trigger SOS, your live location is instantly broadcast to verified neighbors within 2km who have opted in as emergency volunteers. They receive a notification and can respond immediately. Your trusted contacts are also alerted.",
  },
];

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen-dvh flex flex-col bg-background">
      {/* ── Header ── */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all",
          scrolled
            ? "border-b bg-background/85 backdrop-blur-md shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="tap-feedback rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" onClick={onLogin}>
              Login
            </Button>
            <Button size="sm" onClick={onGetStarted} className="gap-1.5">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="tap-feedback grid h-10 w-10 place-items-center rounded-lg border lg:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-background lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="tap-feedback rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-2 flex gap-2 border-t pt-3">
                <Button variant="outline" className="flex-1" onClick={onLogin}>
                  Login
                </Button>
                <Button className="flex-1" onClick={onGetStarted}>
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/20" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-900/20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                India&apos;s hyperlocal super app
              </div>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Your Neighborhood.
                <br />
                <span className="text-gradient">Built on Trust.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
                Connect with verified neighbors, discover local businesses, find jobs and services,
                get help in emergencies, and build a stronger community — all in one trusted app.
              </p>
              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Button size="lg" onClick={onGetStarted} className="w-full gap-2 sm:w-auto">
                  Get Started — it&apos;s free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={onLogin} className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  No passwords — OTP only
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  5-level verification
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Free forever
                </span>
              </div>
            </div>

            {/* Right: app preview mockup */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
                {/* Mock header */}
                <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-lg brand-gradient text-white">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 11l9-7 9 7" />
                        <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold">
                      Neighbor<span className="text-gradient">X</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-muted-foreground">Royal Residency</span>
                  </div>
                </div>
                {/* Mock feed */}
                <div className="space-y-3 p-4">
                  {/* SOS alert */}
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                    <div className="flex items-center gap-2">
                      <Siren className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-bold text-red-700 dark:text-red-400">LIVE SOS · 2h ago</span>
                    </div>
                    <p className="mt-1 text-xs text-foreground">
                      Two-wheeler accident on Latur Road — help needed near HP Pump.
                    </p>
                  </div>
                  {/* Post */}
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">AD</div>
                      <div>
                        <div className="text-xs font-semibold">Arjun Deshmukh</div>
                        <div className="text-[10px] text-muted-foreground">Royal Residency · 2h ago</div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs">
                      🏆 Congratulations to our society cricket team for winning the inter-society tournament! Great teamwork boys.
                    </p>
                    <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                      <span>❤️ 89</span>
                      <span>💬 12</span>
                    </div>
                  </div>
                  {/* Marketplace */}
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-white">RS</div>
                      <div>
                        <div className="text-xs font-semibold">Ravi Shinde · Marketplace</div>
                        <div className="text-[10px] text-muted-foreground">Royal Residency · 5h ago</div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-16 w-16 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold">Steel Almirah — excellent condition</div>
                        <div className="text-sm font-bold text-emerald-600">₹3,500</div>
                        <Badge variant="secondary" className="mt-0.5 text-[9px]">Verified seller</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -right-3 -top-3 hidden rounded-xl border bg-card p-3 shadow-lg sm:block">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">100% Verified</div>
                    <div className="text-[10px] text-muted-foreground">No fake accounts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t pt-8 sm:grid-cols-4 lg:mt-20">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-gradient sm:text-4xl">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">One app, everything local</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              The super app for every Indian neighborhood
            </h2>
            <p className="mt-3 text-muted-foreground">
              From community bonding to local commerce, safety to services — NeighborX brings 12+ essential
              modules into one trusted, verified platform.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className={cn("grid h-11 w-11 place-items-center rounded-lg", f.color)}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Roadmap teaser */}
          <div className="mt-12 rounded-2xl border bg-card p-6 sm:p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Coming soon
              </Badge>
              <h3 className="text-xl font-bold sm:text-2xl">And much more on the roadmap</h3>
              <p className="max-w-xl text-sm text-muted-foreground">
                We&apos;re building the future of hyperlocal living. Here&apos;s what&apos;s coming in Phase 3 &amp; 4:
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {ROADMAP_FEATURES.map((r) => (
                <div key={r.label} className="rounded-lg border bg-background p-3 text-center">
                  <r.icon className="mx-auto h-6 w-6 text-primary" />
                  <div className="mt-2 text-xs font-semibold">{r.label}</div>
                  <div className="text-[10px] text-muted-foreground">{r.phase}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">Get started in minutes</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              How NeighborX works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three simple steps to join your trusted neighborhood community.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className="relative">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-px w-full bg-border md:block" />
                )}
                <div className="relative rounded-xl border bg-card p-6 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full brand-gradient text-white shadow-sm">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-3 text-xs font-bold text-primary">STEP {s.step}</div>
                  <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For You (role-based) ── */}
      <section id="for-you" className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">Built for everyone</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              There&apos;s a place for you in NeighborX
            </h2>
            <p className="mt-3 text-muted-foreground">
              Whether you live here, sell here, serve here, or hire here — NeighborX adapts to you.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {ROLE_SECTIONS.map((r) => (
              <div key={r.title} className="overflow-hidden rounded-2xl border bg-card">
                <div className={cn("bg-gradient-to-r p-5 text-white", r.color)}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/20 backdrop-blur">
                      <r.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{r.title}</h3>
                      <div className="text-sm text-white/80">{r.tagline}</div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 p-5">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety spotlight ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border bg-gradient-to-br from-red-50 via-background to-emerald-50 dark:from-red-950/20 dark:via-background dark:to-emerald-950/20">
            <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge variant="secondary" className="mb-3 gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Safety first
                </Badge>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  When seconds matter, your neighborhood has your back
                </h2>
                <p className="mt-4 text-muted-foreground">
                  NeighborX isn&apos;t just social — it&apos;s a lifeline. One tap on SOS broadcasts your live
                  location to verified neighbors nearby who&apos;ve opted in as emergency volunteers.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { icon: Siren, title: "Emergency SOS", desc: "One-tap broadcast to nearby neighbors + trusted contacts" },
                    { icon: ShieldCheck, title: "Neighborhood Watch", desc: "Real-time alerts for scams, thefts, and suspicious activity" },
                    { icon: Users, title: "Volunteer Network", desc: "Verified emergency responders in your area, ready to help" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-100 dark:bg-red-900/30">
                        <item.icon className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl border bg-card p-5 shadow-lg">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <Siren className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-600">SOS Alert Active</span>
                    <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  </div>
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Location</div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-red-600" />
                        Latur Road, near HP Pump
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Broadcast to</div>
                      <div className="text-sm font-semibold">14 verified neighbors within 2km</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Responders en route</div>
                      <div className="mt-1 flex -space-x-2">
                        {["AD", "PK", "VM", "RS"].map((initials, i) => (
                          <div
                            key={initials}
                            className={cn(
                              "grid h-7 w-7 place-items-center rounded-full border-2 border-card text-[10px] font-bold text-white",
                              ["bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-purple-500"][i],
                            )}
                          >
                            {initials}
                          </div>
                        ))}
                        <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-muted text-[10px] font-bold">
                          +10
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">Loved by neighbors</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              What our community says
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real stories from real neighbors across India.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl border bg-card p-5">
                <Quote className="h-7 w-7 text-primary/30" />
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3 border-t pt-4">
                  <div className={cn("grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white", t.color)}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">Simple, transparent pricing</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Free for neighbors, Pro for pros
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every neighbor gets the full community experience for free. Businesses and service providers
              can upgrade for advanced features.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={cn(
                  "relative rounded-2xl border bg-card p-6",
                  p.color,
                  p.highlight && "lg:-mt-4 lg:mb-4",
                )}
              >
                {p.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                </div>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <Button
                  className="mt-5 w-full"
                  variant={p.highlight ? "default" : "outline"}
                  onClick={onGetStarted}
                >
                  {p.cta}
                </Button>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <span className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              All plans include OTP-based secure login, 5-level verification, and data encryption.
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-3">Got questions?</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to know about NeighborX. Can&apos;t find an answer?{" "}
              <a href="mailto:hello@neighborx.in" className="font-semibold text-primary hover:underline">
                Email us
              </a>
              .
            </p>
          </div>

          <div className="mt-10">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl brand-gradient p-8 text-center text-white sm:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Join your neighborhood today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
                It takes 30 seconds to sign up. No passwords, no spam — just your trusted local community,
                one tap away.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={onGetStarted}
                  className="w-full gap-2 sm:w-auto"
                >
                  Create your free account
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onLogin}
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto"
                >
                  Login
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/80">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  12,000+ neighbors
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                  4.8/5 rating
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  15+ cities
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />

      {/* Mobile safe-area bottom padding */}
      <div className="h-safe-bottom lg:hidden" />
    </div>
  );
}
