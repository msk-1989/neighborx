import type { ModuleKey } from "@/lib/types";
import {
  LayoutDashboard,
  Newspaper,
  ShoppingBag,
  Store,
  Wrench,
  Briefcase,
  Siren,
  ShieldAlert,
  Search,
  CalendarDays,
  Sparkles,
  MessagesSquare,
  UserRound,
} from "lucide-react";

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  group: "home" | "community" | "commerce" | "civic" | "ai" | "you";
}

export const MODULES: ModuleDef[] = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard, desc: "Neighborhood overview", group: "home" },
  { key: "feed", label: "Home Feed", icon: Newspaper, desc: "Neighborhood posts & updates", group: "community" },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag, desc: "Buy & sell locally", group: "commerce" },
  { key: "businesses", label: "Businesses", icon: Store, desc: "Local shops & services", group: "commerce" },
  { key: "services", label: "Services", icon: Wrench, desc: "Book plumbers, tutors & more", group: "commerce" },
  { key: "jobs", label: "Jobs", icon: Briefcase, desc: "Local job opportunities", group: "commerce" },
  { key: "emergency", label: "Emergency SOS", icon: Siren, desc: "Urgent neighborhood alerts", group: "civic" },
  { key: "complaints", label: "Complaints", icon: ShieldAlert, desc: "Civic issues & AI classifier", group: "civic" },
  { key: "lostfound", label: "Lost & Found", icon: Search, desc: "Pets, items & documents", group: "community" },
  { key: "events", label: "Events", icon: CalendarDays, desc: "Community gatherings", group: "community" },
  { key: "assistant", label: "AI Assistant", icon: Sparkles, desc: "Neighborhood help bot", group: "ai" },
  { key: "chat", label: "Community Chat", icon: MessagesSquare, desc: "Real-time neighborhood chat", group: "community" },
  { key: "profile", label: "Profile", icon: UserRound, desc: "Verification & rewards", group: "you" },
];

export const GROUP_LABELS: Record<ModuleDef["group"], string> = {
  home: "",
  community: "Community",
  commerce: "Commerce",
  civic: "Civic & Safety",
  ai: "AI",
  you: "You",
};
