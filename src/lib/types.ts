// Shared NeighborX types

export type ModuleKey =
  | "dashboard"
  | "feed"
  | "groups"
  | "events"
  | "chat"
  | "lostfound"
  | "watch"
  | "emergency"
  | "businesses"
  | "reputation"
  | "profile"
  | "marketplace"
  | "services"
  | "jobs"
  | "complaints"
  | "assistant"
  // Coming-soon placeholders (Phase 2-4)
  | "property"
  | "society"
  | "fundraising"
  | "carpool"
  | "borrow"
  | "commerce"
  | "volunteer"
  | "skills"
  // Phase 5 — Discovery layer (neighborhood-first, not a social feed)
  | "reels"        // Instagram-style HYPERLOCAL short videos
  | "yellowpages"  // Hyperlocal Yellow Pages directory
  | "search"       // Neighborhood search engine (unified)
  // Admin (Super Admin panel — only visible to users with VIEW_ADMIN_PANEL)
  | "admin";

export type VerificationLevel = 1 | 2 | 3 | 4 | 5;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  verifyMobile: boolean;
  verifyEmail: boolean;
  verifyAadhaar: boolean;
  verifyAddress: boolean;
  verifyBusiness: boolean;
  rewardPoints: number;
  tier: string;
  heroLevel: number;
  area: string;
  city: string;
  district: string;
  state: string;
  society: string;
}

export interface Post {
  id: string;
  type: string;
  content: string;
  imageUrl?: string | null;
  pollData?: string | null;
  scope: string;
  tag?: string | null;
  authorId: string;
  author: User;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: User;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  imageUrl?: string | null;
  location: string;
  boosted: boolean;
  status: string;
  sellerId: string;
  seller: User;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string | null;
  verified: boolean;
  featured: boolean;
  offer?: string | null;
  ownerId: string;
}

export interface Service {
  id: string;
  category: string;
  providerName: string;
  bio: string;
  phone: string;
  rating: number;
  jobsDone: number;
  hourlyRate: number;
  avatar?: string | null;
  verified: boolean;
  available: boolean;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  userId: string;
  user: User;
  date: string;
  slot: string;
  note?: string | null;
  status: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  jobType: string;
  salary: string;
  location: string;
  category: string;
  openings: number;
  employerId: string;
  employer: User;
  createdAt: string;
}

export interface Emergency {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  status: string;
  reporterId: string;
  reporter: User;
  responders: number;
  createdAt: string;
}

export interface Complaint {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  imageUrl?: string | null;
  status: string;
  aiCategory?: string | null;
  aiConfidence?: number | null;
  reporterId: string;
  reporter: User;
  upvotes: number;
  createdAt: string;
}

export interface LostFound {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  location: string;
  reward: number;
  status: string;
  reporterId: string;
  reporter: User;
  createdAt: string;
}

export interface NXEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  imageUrl?: string | null;
  organizerId: string;
  organizer: User;
  rsvps: { id: string; status: string }[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender: User;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// ----- helpers -----
export const CATEGORY_COLORS: Record<string, string> = {
  ELECTRONICS: "bg-chart-1/15 text-chart-1",
  FURNITURE: "bg-chart-2/15 text-chart-2",
  VEHICLES: "bg-chart-3/15 text-chart-3",
  FASHION: "bg-chart-5/15 text-chart-5",
  BOOKS: "bg-chart-4/15 text-chart-4",
  APPLIANCES: "bg-primary/15 text-primary",
  GROCERY: "bg-chart-1/15 text-chart-1",
  RESTAURANT: "bg-chart-3/15 text-chart-3",
  CLINIC: "bg-destructive/15 text-destructive",
  PHARMACY: "bg-chart-4/15 text-chart-4",
  SALON: "bg-chart-5/15 text-chart-5",
  GYM: "bg-primary/15 text-primary",
};

export function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function verificationBadges(u: {
  verifyMobile: boolean;
  verifyEmail: boolean;
  verifyAadhaar: boolean;
  verifyAddress: boolean;
  verifyBusiness: boolean;
}) {
  const badges: { label: string; icon: string; level: number; active: boolean }[] = [
    { label: "Mobile", icon: "📱", level: 1, active: u.verifyMobile },
    { label: "Email", icon: "✉", level: 2, active: u.verifyEmail },
    { label: "Aadhaar", icon: "🪪", level: 3, active: u.verifyAadhaar },
    { label: "Address", icon: "🏠", level: 4, active: u.verifyAddress },
    { label: "Business", icon: "🏢", level: 5, active: u.verifyBusiness },
  ];
  return badges;
}

export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

// ===== Phase 1 types =====

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string | null;
  privacy: string;
  scope: string;
  area: string;
  city: string;
  society: string;
  ownerId: string;
  owner: User;
  memberCount: number;
  members?: GroupMember[];
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user: User;
  role: string;
  joinedAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  tier: string;
  points: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  earnedAt: string;
}

export interface WatchAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  status: string;
  reporterId: string;
  reporter: User;
  helpfulCount: number;
  createdAt: string;
}

// Reputation tiers (Pillar 20)
export type ReputationTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "LEGEND";

export const TIER_CONFIG: { tier: ReputationTier; min: number; label: string; color: string; icon: string }[] = [
  { tier: "BRONZE", min: 0, label: "Bronze", color: "bg-amber-700 text-amber-50", icon: "🥉" },
  { tier: "SILVER", min: 150, label: "Silver", color: "bg-slate-400 text-slate-950", icon: "🥈" },
  { tier: "GOLD", min: 400, label: "Gold", color: "bg-amber-400 text-amber-950", icon: "🥇" },
  { tier: "PLATINUM", min: 800, label: "Platinum", color: "bg-cyan-400 text-cyan-950", icon: "💎" },
  { tier: "LEGEND", min: 1500, label: "Legend", color: "bg-fuchsia-500 text-fuchsia-50", icon: "👑" },
];

export function tierForPoints(points: number): ReputationTier {
  let result: ReputationTier = "BRONZE";
  for (const t of TIER_CONFIG) {
    if (points >= t.min) result = t.tier;
  }
  return result;
}

export function nextTier(points: number): { tier: ReputationTier; min: number; label: string; icon: string } | null {
  for (const t of TIER_CONFIG) {
    if (points < t.min) return t;
  }
  return null;
}

// =====================================================================
// Phase 3-4 — Balance Features
// =====================================================================

export interface BorrowItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  condition: string;
  imageUrl?: string | null;
  dailyRate: number;
  deposit: number;
  duration: string;
  location: string;
  status: string;
  ownerId: string;
  owner: User;
  createdAt: string;
}

export interface SkillListing {
  id: string;
  title: string;
  description: string;
  category: string;
  mode: string;
  level: string;
  rate: number;
  location: string;
  availability: string;
  status: string;
  teacherId: string;
  teacher: User;
  createdAt: string;
}

export interface CarpoolRide {
  id: string;
  type: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  seats: number;
  seatsFilled: number;
  recurring: string;
  notes?: string | null;
  contribution: number;
  status: string;
  driverId: string;
  driver: User;
  createdAt: string;
}

export interface VolunteerOpportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  urgency: string;
  date?: string | null;
  contactInfo: string;
  slots: number;
  filled: number;
  status: string;
  organizerId: string;
  organizer: User;
  signups?: VolunteerSignup[];
  createdAt: string;
}

export interface VolunteerSignup {
  id: string;
  opportunityId: string;
  userId: string;
  user: User;
  status: string;
  createdAt: string;
}

export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  story: string;
  category: string;
  goal: number;
  raised: number;
  imageUrl?: string | null;
  beneficiaryName: string;
  endDate: string;
  verified: boolean;
  status: string;
  organizerId: string;
  organizer: User;
  donations?: FundraiserDonation[];
  createdAt: string;
}

export interface FundraiserDonation {
  id: string;
  fundraiserId: string;
  donorId: string;
  donor: User;
  amount: number;
  message?: string | null;
  anonymous: boolean;
  createdAt: string;
}

export interface PropertyListing {
  id: string;
  title: string;
  description: string;
  type: string;
  propertyType: string;
  price: number;
  rent: number;
  deposit: number;
  area: string;
  furnishing: string;
  address: string;
  imageUrl?: string | null;
  bedrooms: number;
  bathrooms: number;
  amenities?: string | null;
  location: string;
  status: string;
  ownerId: string;
  owner: User;
  createdAt: string;
}

export interface CommerceProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  imageUrl?: string | null;
  storeName: string;
  deliveryTime: string;
  inStock: boolean;
  location: string;
  sellerId: string;
  seller: User;
  createdAt: string;
}

export interface CommerceOrder {
  id: string;
  productId: string;
  buyerId: string;
  buyer: User;
  qty: number;
  total: number;
  note?: string | null;
  status: string;
  createdAt: string;
}

// =====================================================================
// Phase 5 — Reels (Instagram-style short videos)
// =====================================================================

export interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  caption: string;
  music?: string | null;
  hashtags?: string | null; // comma-separated, e.g. "udgir,diwali,neighborhood"
  category: string;
  status: string;
  likes: number;
  views: number;
  authorId: string;
  author: User;
  /** comments array — only populated by the comments endpoint, not the list endpoint */
  comments?: ReelComment[];
  /** comment count — set by the API list endpoint */
  commentCount?: number;
  /** whether the current user has liked this reel */
  isLiked?: boolean;
  createdAt: string;
}

export interface ReelComment {
  id: string;
  content: string;
  reelId: string;
  authorId: string;
  author: User;
  createdAt: string;
}

// =====================================================================
// Phase 5 — Hyperlocal Yellow Pages (discovery directory)
// =====================================================================

export type YellowPageCategory =
  | "HEALTHCARE"
  | "EDUCATION"
  | "HOME_SERVICES"
  | "BUSINESS"
  | "GOVERNMENT"
  | "RELIGIOUS"
  | "EMERGENCY";

export interface YellowPageEntry {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description?: string | null;
  address: string;
  area: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  hours?: string | null;
  imageUrl?: string | null;
  rating: number;
  reviewCount: number;
  verified: boolean;
  ownerId?: string | null;
  createdAt: string;
}

// =====================================================================
// Phase 5 — Neighborhood Search Engine (unified search results)
// =====================================================================

export interface SearchResult<T = unknown> {
  type:
    | "post"
    | "business"
    | "reel"
    | "job"
    | "property"
    | "service"
    | "yellowpage"
    | "marketplace";
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  href?: string;
  data: T;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
  /** counts per type, for the UI tabs */
  counts: Record<SearchResult["type"], number>;
}
