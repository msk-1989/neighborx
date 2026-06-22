import type { ModuleKey } from "@/lib/types";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  CalendarDays,
  MessagesSquare,
  Search,
  ShieldCheck,
  Siren,
  Store,
  Trophy,
  UserRound,
  // Phase 2-3 (existing, reorganized)
  ShoppingBag,
  Wrench,
  Briefcase,
  ShieldAlert,
  // Phase 4 — AI
  Sparkles,
  // Coming soon icons
  Home,
  Building2,
  HeartHandshake,
  Car,
  PackageOpen,
  ShoppingBasket,
  HandHeart,
  GraduationCap,
} from "lucide-react";

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  group: "home" | "community" | "trust" | "safety" | "commerce" | "civic" | "ai" | "you" | "coming-soon";
  /** Product roadmap phase — drives the "Phase N" badge in the sidebar */
  phase: 1 | 2 | 3 | 4;
  /** If true, module is a placeholder with no implementation yet */
  comingSoon?: boolean;
}

/**
 * NeighborX 4.0 — Master Product Blueprint navigation
 *
 * Phase 1 (Launch): Community, Trust, Safety, Businesses, Groups, Events, Emergency, Reputation
 * Phase 2: Marketplace, Services, Jobs
 * Phase 3: Property, Society Management, Civic Complaints
 * Phase 4: AI, Multinex Commerce, Fundraising, Carpool, Borrow & Lend, Volunteer, Skills
 */
export const MODULES: ModuleDef[] = [
  // ── Home ──
  { key: "dashboard", label: "Home", icon: LayoutDashboard, desc: "Neighborhood overview", group: "home", phase: 1 },

  // ── Phase 1: Community ──
  { key: "feed", label: "Home Feed", icon: Newspaper, desc: "Neighborhood posts & updates", group: "community", phase: 1 },
  { key: "groups", label: "Groups", icon: Users, desc: "Community groups & circles", group: "community", phase: 1 },
  { key: "events", label: "Events", icon: CalendarDays, desc: "Community gatherings", group: "community", phase: 1 },
  { key: "chat", label: "Community Chat", icon: MessagesSquare, desc: "Real-time neighborhood chat", group: "community", phase: 1 },
  { key: "lostfound", label: "Lost & Found", icon: Search, desc: "Pets, items & documents", group: "community", phase: 1 },

  // ── Phase 1: Safety ──
  { key: "watch", label: "Neighborhood Watch", icon: ShieldCheck, desc: "Scam, crime & safety alerts", group: "safety", phase: 1 },
  { key: "emergency", label: "Emergency SOS", icon: Siren, desc: "Urgent neighborhood alerts", group: "safety", phase: 1 },

  // ── Phase 1: Trust & Reputation ──
  { key: "reputation", label: "Reputation & Rewards", icon: Trophy, desc: "Trust tiers, achievements, leaderboard", group: "trust", phase: 1 },
  { key: "profile", label: "Profile & Verification", icon: UserRound, desc: "5-level verification & identity", group: "trust", phase: 1 },

  // ── Phase 1: Businesses ──
  { key: "businesses", label: "Businesses", icon: Store, desc: "Local shops & services", group: "commerce", phase: 1 },

  // ── Phase 2: Marketplace, Services, Jobs ──
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag, desc: "Buy & sell locally", group: "commerce", phase: 2 },
  { key: "services", label: "Services", icon: Wrench, desc: "Book plumbers, tutors & more", group: "commerce", phase: 2 },
  { key: "jobs", label: "Jobs", icon: Briefcase, desc: "Local job opportunities", group: "commerce", phase: 2 },

  // ── Phase 3: Property, Society, Civic ──
  { key: "complaints", label: "Civic Complaints", icon: ShieldAlert, desc: "Civic issues & AI classifier", group: "civic", phase: 3 },
  { key: "property", label: "Property", icon: Home, desc: "Buy, sell, rent, PG — hyperlocal real estate", group: "coming-soon", phase: 3, comingSoon: true },
  { key: "society", label: "Society Management", icon: Building2, desc: "Visitor, maintenance, notices, polls", group: "coming-soon", phase: 3, comingSoon: true },

  // ── Phase 4: AI, Commerce, Community ──
  { key: "assistant", label: "AI Assistant", icon: Sparkles, desc: "Neighborhood help bot", group: "ai", phase: 4 },
  { key: "commerce", label: "Multinex Commerce", icon: ShoppingBasket, desc: "Grocery, food, medicine, parcels", group: "coming-soon", phase: 4, comingSoon: true },
  { key: "fundraising", label: "Fundraising", icon: HeartHandshake, desc: "Medical, education, NGO campaigns", group: "coming-soon", phase: 4, comingSoon: true },
  { key: "volunteer", label: "Volunteer Network", icon: HandHeart, desc: "Blood donors, disaster, community", group: "coming-soon", phase: 4, comingSoon: true },
  { key: "carpool", label: "Carpool & Mobility", icon: Car, desc: "Office, school, shared rides", group: "coming-soon", phase: 4, comingSoon: true },
  { key: "borrow", label: "Borrow & Lend", icon: PackageOpen, desc: "Books, tools, equipment sharing", group: "coming-soon", phase: 4, comingSoon: true },
  { key: "skills", label: "Skill Exchange", icon: GraduationCap, desc: "Language, music, computer training", group: "coming-soon", phase: 4, comingSoon: true },
];

export const GROUP_LABELS: Record<ModuleDef["group"], string> = {
  home: "",
  community: "Community",
  trust: "Trust & Reputation",
  safety: "Safety",
  commerce: "Commerce",
  civic: "Civic",
  ai: "AI",
  you: "",
  "coming-soon": "Coming Soon · Roadmap",
};

// Order in which groups appear in the sidebar
export const GROUP_ORDER: ModuleDef["group"][] = [
  "home",
  "community",
  "safety",
  "trust",
  "commerce",
  "civic",
  "ai",
  "coming-soon",
];

export const PHASE_LABELS: Record<number, string> = {
  1: "Phase 1 · Launch",
  2: "Phase 2",
  3: "Phase 3",
  4: "Phase 4",
};
