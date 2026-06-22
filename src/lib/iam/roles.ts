/**
 * IAM — Identity & Access Management
 * ====================================================================
 * NeighborX RBAC layer. Every screen, button, API and action is
 * controlled by Roles + Permissions.
 *
 * Role hierarchy:
 *   User roles (level 0):
 *     GUEST, RESIDENT, VERIFIED_RESIDENT, BUSINESS_OWNER, SERVICE_PROVIDER,
 *     EMPLOYER, PROPERTY_OWNER, VOLUNTEER
 *
 *   Admin hierarchy (level 1-10):
 *     1  SOCIETY_ADMIN
 *     2  AREA_MODERATOR
 *     3  CITY_MODERATOR
 *     4  BUSINESS_ADMIN
 *     5  ORG_ADMIN
 *     6  SUPPORT_ADMIN
 *     7  OPERATIONS_ADMIN
 *     8  REVENUE_ADMIN
 *     9  COMPLIANCE_ADMIN
 *     10 SUPER_ADMIN
 */

// ---------------------------------------------------------------------------
// Role codes
// ---------------------------------------------------------------------------
export const ROLE = {
  // user-facing (level 0)
  GUEST: "GUEST",
  RESIDENT: "RESIDENT",
  VERIFIED_RESIDENT: "VERIFIED_RESIDENT",
  BUSINESS_OWNER: "BUSINESS_OWNER",
  SERVICE_PROVIDER: "SERVICE_PROVIDER",
  EMPLOYER: "EMPLOYER",
  PROPERTY_OWNER: "PROPERTY_OWNER",
  VOLUNTEER: "VOLUNTEER",
  // admin hierarchy (level 1-10)
  SOCIETY_ADMIN: "SOCIETY_ADMIN",
  AREA_MODERATOR: "AREA_MODERATOR",
  CITY_MODERATOR: "CITY_MODERATOR",
  BUSINESS_ADMIN: "BUSINESS_ADMIN",
  ORG_ADMIN: "ORG_ADMIN",
  SUPPORT_ADMIN: "SUPPORT_ADMIN",
  OPERATIONS_ADMIN: "OPERATIONS_ADMIN",
  REVENUE_ADMIN: "REVENUE_ADMIN",
  COMPLIANCE_ADMIN: "COMPLIANCE_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type RoleCode = (typeof ROLE)[keyof typeof ROLE];

// ---------------------------------------------------------------------------
// Role metadata (label, level, category, description, icon emoji, badge color)
// ---------------------------------------------------------------------------
export interface RoleMeta {
  code: RoleCode;
  name: string;
  level: number;
  category: "USER" | "ADMIN";
  description: string;
  emoji: string;
  /** tailwind text color class for the badge */
  color: string;
}

export const ROLE_META: Record<RoleCode, RoleMeta> = {
  [ROLE.GUEST]: {
    code: ROLE.GUEST, name: "Guest", level: 0, category: "USER",
    description: "Without login. Can view public posts, businesses, jobs, properties, events.",
    emoji: "👀", color: "text-slate-500",
  },
  [ROLE.RESIDENT]: {
    code: ROLE.RESIDENT, name: "Resident", level: 0, category: "USER",
    description: "Logged-in neighbor. Can post, join groups, chat, buy/sell, book services, apply jobs.",
    emoji: "🏠", color: "text-emerald-600",
  },
  [ROLE.VERIFIED_RESIDENT]: {
    code: ROLE.VERIFIED_RESIDENT, name: "Verified Resident", level: 0, category: "USER",
    description: "Verified neighbor. Can create recommendations, safety alerts, access directory, volunteer.",
    emoji: "✅", color: "text-emerald-700",
  },
  [ROLE.BUSINESS_OWNER]: {
    code: ROLE.BUSINESS_OWNER, name: "Business Owner", level: 0, category: "USER",
    description: "Can create business profile, add offers/products, receive leads, view analytics.",
    emoji: "🏪", color: "text-amber-600",
  },
  [ROLE.SERVICE_PROVIDER]: {
    code: ROLE.SERVICE_PROVIDER, name: "Service Provider", level: 0, category: "USER",
    description: "Can create provider profile, manage bookings, set availability, receive payments.",
    emoji: "🔧", color: "text-cyan-600",
  },
  [ROLE.EMPLOYER]: {
    code: ROLE.EMPLOYER, name: "Employer", level: 0, category: "USER",
    description: "Can post jobs, manage candidates, schedule interviews, hire applicants.",
    emoji: "💼", color: "text-indigo-600",
  },
  [ROLE.PROPERTY_OWNER]: {
    code: ROLE.PROPERTY_OWNER, name: "Property Owner / Broker", level: 0, category: "USER",
    description: "Can add properties, manage visits, manage leads, boost properties.",
    emoji: "🏢", color: "text-violet-600",
  },
  [ROLE.VOLUNTEER]: {
    code: ROLE.VOLUNTEER, name: "Community Volunteer", level: 0, category: "USER",
    description: "Can help emergencies, blood donation alerts, disaster support. Special badge: 🦸 Community Hero.",
    emoji: "🦸", color: "text-fuchsia-600",
  },
  // admin hierarchy
  [ROLE.SOCIETY_ADMIN]: {
    code: ROLE.SOCIETY_ADMIN, name: "Society Admin", level: 1, category: "ADMIN",
    description: "e.g. Royal Residency Admin. Verify residents, manage society groups, notices, visitors, complaints.",
    emoji: "🏘️", color: "text-blue-600",
  },
  [ROLE.AREA_MODERATOR]: {
    code: ROLE.AREA_MODERATOR, name: "Area Moderator", level: 2, category: "ADMIN",
    description: "e.g. Khair Nagar Moderator. Moderate posts, remove spam, verify alerts, manage area channels.",
    emoji: "📍", color: "text-blue-700",
  },
  [ROLE.CITY_MODERATOR]: {
    code: ROLE.CITY_MODERATOR, name: "City Moderator", level: 3, category: "ADMIN",
    description: "e.g. Udgir Moderator. Moderate all area feeds, manage city news, handle escalations.",
    emoji: "🌆", color: "text-blue-800",
  },
  [ROLE.BUSINESS_ADMIN]: {
    code: ROLE.BUSINESS_ADMIN, name: "Business Admin", level: 4, category: "ADMIN",
    description: "Manage business profile, add offers, manage leads, manage employees.",
    emoji: "📊", color: "text-teal-600",
  },
  [ROLE.ORG_ADMIN]: {
    code: ROLE.ORG_ADMIN, name: "Organization Admin", level: 5, category: "ADMIN",
    description: "Masjid Committee / School / NGO. Manage members, announcements, events, donations.",
    emoji: "🏛️", color: "text-teal-700",
  },
  [ROLE.SUPPORT_ADMIN]: {
    code: ROLE.SUPPORT_ADMIN, name: "Support Admin", level: 6, category: "ADMIN",
    description: "Handle tickets, chat support, user verification support.",
    emoji: "🎧", color: "text-orange-600",
  },
  [ROLE.OPERATIONS_ADMIN]: {
    code: ROLE.OPERATIONS_ADMIN, name: "Operations Admin", level: 7, category: "ADMIN",
    description: "Verify businesses, service providers, properties, fundraising campaigns.",
    emoji: "⚙️", color: "text-orange-700",
  },
  [ROLE.REVENUE_ADMIN]: {
    code: ROLE.REVENUE_ADMIN, name: "Revenue Admin", level: 8, category: "ADMIN",
    description: "View payments, manage subscriptions, commissions, invoices.",
    emoji: "💰", color: "text-green-700",
  },
  [ROLE.COMPLIANCE_ADMIN]: {
    code: ROLE.COMPLIANCE_ADMIN, name: "Compliance Admin", level: 9, category: "ADMIN",
    description: "Review abuse reports, legal requests, privacy requests, content takedowns.",
    emoji: "⚖️", color: "text-rose-700",
  },
  [ROLE.SUPER_ADMIN]: {
    code: ROLE.SUPER_ADMIN, name: "Super Admin", level: 10, category: "ADMIN",
    description: "Highest authority. Can manage EVERYTHING across all modules.",
    emoji: "👑", color: "text-fuchsia-700",
  },
};

export const ALL_ROLE_CODES = Object.keys(ROLE_META) as RoleCode[];
export const USER_ROLE_CODES = ALL_ROLE_CODES.filter((c) => ROLE_META[c].category === "USER");
export const ADMIN_ROLE_CODES = ALL_ROLE_CODES.filter((c) => ROLE_META[c].category === "ADMIN");

// ---------------------------------------------------------------------------
// Permission codes — grouped by module
// ---------------------------------------------------------------------------
export const PERMISSION = {
  // Community
  VIEW_POST: "VIEW_POST",
  CREATE_POST: "CREATE_POST",
  UPDATE_OWN_POST: "UPDATE_OWN_POST",
  DELETE_OWN_POST: "DELETE_OWN_POST",
  DELETE_ANY_POST: "DELETE_ANY_POST",
  MODERATE_POSTS: "MODERATE_POSTS",
  CREATE_COMMENT: "CREATE_COMMENT",
  // Trust / Verification
  REQUEST_VERIFICATION: "REQUEST_VERIFICATION",
  VERIFY_USER: "VERIFY_USER",
  VERIFY_AADHAAR: "VERIFY_AADHAAR",
  VERIFY_ADDRESS: "VERIFY_ADDRESS",
  // Marketplace
  CREATE_LISTING: "CREATE_LISTING",
  DELETE_ANY_LISTING: "DELETE_ANY_LISTING",
  MANAGE_CATEGORIES: "MANAGE_CATEGORIES",
  // Business
  CREATE_BUSINESS: "CREATE_BUSINESS",
  MANAGE_OWN_BUSINESS: "MANAGE_OWN_BUSINESS",
  APPROVE_BUSINESS: "APPROVE_BUSINESS",
  MANAGE_REVIEWS: "MANAGE_REVIEWS",
  // Service
  CREATE_SERVICE: "CREATE_SERVICE",
  MANAGE_BOOKINGS: "MANAGE_BOOKINGS",
  APPROVE_SERVICE_PROVIDER: "APPROVE_SERVICE_PROVIDER",
  // Job
  CREATE_JOB: "CREATE_JOB",
  MANAGE_CANDIDATES: "MANAGE_CANDIDATES",
  // Property
  CREATE_PROPERTY: "CREATE_PROPERTY",
  APPROVE_PROPERTY: "APPROVE_PROPERTY",
  // Safety
  CREATE_ALERT: "CREATE_ALERT",
  VERIFY_ALERT: "VERIFY_ALERT",
  VIEW_SOS: "VIEW_SOS",
  // Society
  MANAGE_SOCIETY: "MANAGE_SOCIETY",
  MANAGE_VISITORS: "MANAGE_VISITORS",
  MANAGE_NOTICES: "MANAGE_NOTICES",
  // Civic
  MANAGE_COMPLAINTS: "MANAGE_COMPLAINTS",
  // News
  MANAGE_NEWS: "MANAGE_NEWS",
  // Rewards
  MANAGE_REWARDS: "MANAGE_REWARDS",
  MANAGE_LEVELS: "MANAGE_LEVELS",
  // AI
  MANAGE_AI: "MANAGE_AI",
  // Finance
  VIEW_REVENUE: "VIEW_REVENUE",
  MANAGE_PAYMENTS: "MANAGE_PAYMENTS",
  MANAGE_SUBSCRIPTIONS: "MANAGE_SUBSCRIPTIONS",
  MANAGE_REFUNDS: "MANAGE_REFUNDS",
  MANAGE_PAYOUTS: "MANAGE_PAYOUTS",
  // CMS
  MANAGE_CMS: "MANAGE_CMS",
  // Settings
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
  MANAGE_LOCATIONS: "MANAGE_LOCATIONS",
  // IAM
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_ROLES: "MANAGE_ROLES",
  ASSIGN_ROLES: "ASSIGN_ROLES",
  VIEW_ADMIN_PANEL: "VIEW_ADMIN_PANEL",
  // Support
  HANDLE_TICKETS: "HANDLE_TICKETS",
  // Operations
  APPROVE_FUNDRAISING: "APPROVE_FUNDRAISING",
  // Compliance
  REVIEW_REPORTS: "REVIEW_REPORTS",
  CONTENT_TAKEDOWN: "CONTENT_TAKEDOWN",
  SUSPEND_USER: "SUSPEND_USER",
  BAN_USER: "BAN_USER",
} as const;

export type PermissionCode = (typeof PERMISSION)[keyof typeof PERMISSION];

export const ALL_PERMISSION_CODES = Object.values(PERMISSION);

// ---------------------------------------------------------------------------
// Permission metadata (module + action + name + description)
// ---------------------------------------------------------------------------
export interface PermissionMeta {
  code: PermissionCode;
  name: string;
  module: string;
  action: string;
  description: string;
}

export const PERMISSION_META: Record<PermissionCode, PermissionMeta> = {
  [PERMISSION.VIEW_POST]: { code: PERMISSION.VIEW_POST, name: "View Posts", module: "COMMUNITY", action: "READ", description: "View community feed posts" },
  [PERMISSION.CREATE_POST]: { code: PERMISSION.CREATE_POST, name: "Create Post", module: "COMMUNITY", action: "CREATE", description: "Create new feed posts" },
  [PERMISSION.UPDATE_OWN_POST]: { code: PERMISSION.UPDATE_OWN_POST, name: "Edit Own Post", module: "COMMUNITY", action: "UPDATE", description: "Edit own posts" },
  [PERMISSION.DELETE_OWN_POST]: { code: PERMISSION.DELETE_OWN_POST, name: "Delete Own Post", module: "COMMUNITY", action: "DELETE", description: "Delete own posts" },
  [PERMISSION.DELETE_ANY_POST]: { code: PERMISSION.DELETE_ANY_POST, name: "Delete Any Post", module: "COMMUNITY", action: "DELETE", description: "Delete any user's post (moderation)" },
  [PERMISSION.MODERATE_POSTS]: { code: PERMISSION.MODERATE_POSTS, name: "Moderate Posts", module: "COMMUNITY", action: "MANAGE", description: "Moderate all community posts" },
  [PERMISSION.CREATE_COMMENT]: { code: PERMISSION.CREATE_COMMENT, name: "Comment", module: "COMMUNITY", action: "CREATE", description: "Comment on posts" },
  [PERMISSION.REQUEST_VERIFICATION]: { code: PERMISSION.REQUEST_VERIFICATION, name: "Request Verification", module: "TRUST", action: "CREATE", description: "Submit verification requests" },
  [PERMISSION.VERIFY_USER]: { code: PERMISSION.VERIFY_USER, name: "Verify User", module: "TRUST", action: "VERIFY", description: "Approve user verification requests" },
  [PERMISSION.VERIFY_AADHAAR]: { code: PERMISSION.VERIFY_AADHAAR, name: "Verify Aadhaar", module: "TRUST", action: "VERIFY", description: "Approve Aadhaar verification" },
  [PERMISSION.VERIFY_ADDRESS]: { code: PERMISSION.VERIFY_ADDRESS, name: "Verify Address", module: "TRUST", action: "VERIFY", description: "Approve address verification" },
  [PERMISSION.CREATE_LISTING]: { code: PERMISSION.CREATE_LISTING, name: "Create Listing", module: "MARKETPLACE", action: "CREATE", description: "Create marketplace listings" },
  [PERMISSION.DELETE_ANY_LISTING]: { code: PERMISSION.DELETE_ANY_LISTING, name: "Delete Any Listing", module: "MARKETPLACE", action: "DELETE", description: "Delete any marketplace listing" },
  [PERMISSION.MANAGE_CATEGORIES]: { code: PERMISSION.MANAGE_CATEGORIES, name: "Manage Categories", module: "MARKETPLACE", action: "MANAGE", description: "Manage marketplace categories" },
  [PERMISSION.CREATE_BUSINESS]: { code: PERMISSION.CREATE_BUSINESS, name: "Create Business", module: "BUSINESS", action: "CREATE", description: "Create business profile" },
  [PERMISSION.MANAGE_OWN_BUSINESS]: { code: PERMISSION.MANAGE_OWN_BUSINESS, name: "Manage Own Business", module: "BUSINESS", action: "MANAGE", description: "Manage own business profile, offers, products" },
  [PERMISSION.APPROVE_BUSINESS]: { code: PERMISSION.APPROVE_BUSINESS, name: "Approve Business", module: "BUSINESS", action: "APPROVE", description: "Verify and approve business listings" },
  [PERMISSION.MANAGE_REVIEWS]: { code: PERMISSION.MANAGE_REVIEWS, name: "Manage Reviews", module: "BUSINESS", action: "MANAGE", description: "Moderate business reviews" },
  [PERMISSION.CREATE_SERVICE]: { code: PERMISSION.CREATE_SERVICE, name: "Create Service", module: "SERVICE", action: "CREATE", description: "Create service provider profile" },
  [PERMISSION.MANAGE_BOOKINGS]: { code: PERMISSION.MANAGE_BOOKINGS, name: "Manage Bookings", module: "SERVICE", action: "MANAGE", description: "Manage service bookings" },
  [PERMISSION.APPROVE_SERVICE_PROVIDER]: { code: PERMISSION.APPROVE_SERVICE_PROVIDER, name: "Approve Service Provider", module: "SERVICE", action: "APPROVE", description: "Verify and approve service providers" },
  [PERMISSION.CREATE_JOB]: { code: PERMISSION.CREATE_JOB, name: "Post Job", module: "JOB", action: "CREATE", description: "Post new job listings" },
  [PERMISSION.MANAGE_CANDIDATES]: { code: PERMISSION.MANAGE_CANDIDATES, name: "Manage Candidates", module: "JOB", action: "MANAGE", description: "Review and manage job candidates" },
  [PERMISSION.CREATE_PROPERTY]: { code: PERMISSION.CREATE_PROPERTY, name: "Add Property", module: "PROPERTY", action: "CREATE", description: "Add property listings" },
  [PERMISSION.APPROVE_PROPERTY]: { code: PERMISSION.APPROVE_PROPERTY, name: "Approve Property", module: "PROPERTY", action: "APPROVE", description: "Verify and approve property listings" },
  [PERMISSION.CREATE_ALERT]: { code: PERMISSION.CREATE_ALERT, name: "Create Safety Alert", module: "SAFETY", action: "CREATE", description: "Create neighborhood watch alerts" },
  [PERMISSION.VERIFY_ALERT]: { code: PERMISSION.VERIFY_ALERT, name: "Verify Alert", module: "SAFETY", action: "VERIFY", description: "Verify safety alerts" },
  [PERMISSION.VIEW_SOS]: { code: PERMISSION.VIEW_SOS, name: "View SOS", module: "SAFETY", action: "VIEW", description: "View all SOS emergencies" },
  [PERMISSION.MANAGE_SOCIETY]: { code: PERMISSION.MANAGE_SOCIETY, name: "Manage Society", module: "SOCIETY", action: "MANAGE", description: "Manage society settings and residents" },
  [PERMISSION.MANAGE_VISITORS]: { code: PERMISSION.MANAGE_VISITORS, name: "Manage Visitors", module: "SOCIETY", action: "MANAGE", description: "Manage visitor entries" },
  [PERMISSION.MANAGE_NOTICES]: { code: PERMISSION.MANAGE_NOTICES, name: "Manage Notices", module: "SOCIETY", action: "MANAGE", description: "Publish society notices" },
  [PERMISSION.MANAGE_COMPLAINTS]: { code: PERMISSION.MANAGE_COMPLAINTS, name: "Manage Complaints", module: "CIVIC", action: "MANAGE", description: "Manage civic complaints" },
  [PERMISSION.MANAGE_NEWS]: { code: PERMISSION.MANAGE_NEWS, name: "Manage News", module: "NEWS", action: "MANAGE", description: "Manage city news and articles" },
  [PERMISSION.MANAGE_REWARDS]: { code: PERMISSION.MANAGE_REWARDS, name: "Manage Rewards", module: "REWARDS", action: "MANAGE", description: "Manage reward points" },
  [PERMISSION.MANAGE_LEVELS]: { code: PERMISSION.MANAGE_LEVELS, name: "Manage Levels", module: "REWARDS", action: "MANAGE", description: "Manage reputation tiers and levels" },
  [PERMISSION.MANAGE_AI]: { code: PERMISSION.MANAGE_AI, name: "Manage AI", module: "AI", action: "MANAGE", description: "Manage AI moderation and recommendations" },
  [PERMISSION.VIEW_REVENUE]: { code: PERMISSION.VIEW_REVENUE, name: "View Revenue", module: "FINANCE", action: "VIEW", description: "View revenue and financial reports" },
  [PERMISSION.MANAGE_PAYMENTS]: { code: PERMISSION.MANAGE_PAYMENTS, name: "Manage Payments", module: "FINANCE", action: "MANAGE", description: "Manage payment transactions" },
  [PERMISSION.MANAGE_SUBSCRIPTIONS]: { code: PERMISSION.MANAGE_SUBSCRIPTIONS, name: "Manage Subscriptions", module: "FINANCE", action: "MANAGE", description: "Manage subscription plans" },
  [PERMISSION.MANAGE_REFUNDS]: { code: PERMISSION.MANAGE_REFUNDS, name: "Manage Refunds", module: "FINANCE", action: "MANAGE", description: "Process refunds" },
  [PERMISSION.MANAGE_PAYOUTS]: { code: PERMISSION.MANAGE_PAYOUTS, name: "Manage Payouts", module: "FINANCE", action: "MANAGE", description: "Process payouts" },
  [PERMISSION.MANAGE_CMS]: { code: PERMISSION.MANAGE_CMS, name: "Manage CMS", module: "CMS", action: "MANAGE", description: "Manage pages, blogs, FAQs" },
  [PERMISSION.MANAGE_SETTINGS]: { code: PERMISSION.MANAGE_SETTINGS, name: "Manage Settings", module: "SETTINGS", action: "MANAGE", description: "Manage platform settings" },
  [PERMISSION.MANAGE_LOCATIONS]: { code: PERMISSION.MANAGE_LOCATIONS, name: "Manage Locations", module: "SETTINGS", action: "MANAGE", description: "Manage countries, states, cities, areas" },
  [PERMISSION.MANAGE_USERS]: { code: PERMISSION.MANAGE_USERS, name: "Manage Users", module: "IAM", action: "MANAGE", description: "View and manage all users" },
  [PERMISSION.MANAGE_ROLES]: { code: PERMISSION.MANAGE_ROLES, name: "Manage Roles", module: "IAM", action: "MANAGE", description: "Create and edit roles" },
  [PERMISSION.ASSIGN_ROLES]: { code: PERMISSION.ASSIGN_ROLES, name: "Assign Roles", module: "IAM", action: "MANAGE", description: "Assign roles to users" },
  [PERMISSION.VIEW_ADMIN_PANEL]: { code: PERMISSION.VIEW_ADMIN_PANEL, name: "View Admin Panel", module: "IAM", action: "VIEW", description: "Access the admin panel" },
  [PERMISSION.HANDLE_TICKETS]: { code: PERMISSION.HANDLE_TICKETS, name: "Handle Tickets", module: "SUPPORT", action: "MANAGE", description: "Handle support tickets" },
  [PERMISSION.APPROVE_FUNDRAISING]: { code: PERMISSION.APPROVE_FUNDRAISING, name: "Approve Fundraising", module: "OPERATIONS", action: "APPROVE", description: "Approve fundraising campaigns" },
  [PERMISSION.REVIEW_REPORTS]: { code: PERMISSION.REVIEW_REPORTS, name: "Review Reports", module: "COMPLIANCE", action: "MANAGE", description: "Review abuse reports" },
  [PERMISSION.CONTENT_TAKEDOWN]: { code: PERMISSION.CONTENT_TAKEDOWN, name: "Content Takedown", module: "COMPLIANCE", action: "MANAGE", description: "Remove content" },
  [PERMISSION.SUSPEND_USER]: { code: PERMISSION.SUSPEND_USER, name: "Suspend User", module: "COMPLIANCE", action: "MANAGE", description: "Suspend user accounts" },
  [PERMISSION.BAN_USER]: { code: PERMISSION.BAN_USER, name: "Ban User", module: "COMPLIANCE", action: "MANAGE", description: "Ban user accounts" },
};

// ---------------------------------------------------------------------------
// Role → Permission mapping (the RBAC policy matrix)
// ---------------------------------------------------------------------------
// Super Admin gets every permission. Lower admins get progressively fewer.
const ALL_PERMS = ALL_PERMISSION_CODES;

const SUPER_ADMIN_PERMS = ALL_PERMS;

const COMPLIANCE_ADMIN_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.DELETE_ANY_POST, PERMISSION.MODERATE_POSTS,
  PERMISSION.REVIEW_REPORTS, PERMISSION.CONTENT_TAKEDOWN,
  PERMISSION.SUSPEND_USER, PERMISSION.BAN_USER,
  PERMISSION.VIEW_ADMIN_PANEL, PERMISSION.MANAGE_USERS,
];

const REVENUE_ADMIN_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_REVENUE, PERMISSION.MANAGE_PAYMENTS,
  PERMISSION.MANAGE_SUBSCRIPTIONS, PERMISSION.MANAGE_REFUNDS,
  PERMISSION.MANAGE_PAYOUTS, PERMISSION.VIEW_ADMIN_PANEL,
];

const OPERATIONS_ADMIN_PERMS: PermissionCode[] = [
  PERMISSION.VERIFY_USER, PERMISSION.VERIFY_AADHAAR, PERMISSION.VERIFY_ADDRESS,
  PERMISSION.APPROVE_BUSINESS, PERMISSION.APPROVE_SERVICE_PROVIDER,
  PERMISSION.APPROVE_PROPERTY, PERMISSION.APPROVE_FUNDRAISING,
  PERMISSION.VIEW_ADMIN_PANEL,
];

const SUPPORT_ADMIN_PERMS: PermissionCode[] = [
  PERMISSION.HANDLE_TICKETS, PERMISSION.VERIFY_USER,
  PERMISSION.VIEW_ADMIN_PANEL, PERMISSION.MANAGE_USERS,
];

const ORG_ADMIN_PERMS: PermissionCode[] = [
  PERMISSION.CREATE_POST, PERMISSION.UPDATE_OWN_POST, PERMISSION.DELETE_OWN_POST,
  PERMISSION.MANAGE_NOTICES, PERMISSION.VIEW_ADMIN_PANEL,
];

const BUSINESS_ADMIN_PERMS: PermissionCode[] = [
  PERMISSION.CREATE_BUSINESS, PERMISSION.MANAGE_OWN_BUSINESS,
  PERMISSION.MANAGE_REVIEWS, PERMISSION.VIEW_ADMIN_PANEL,
];

const CITY_MODERATOR_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.DELETE_ANY_POST, PERMISSION.MODERATE_POSTS,
  PERMISSION.VERIFY_ALERT, PERMISSION.MANAGE_NEWS,
  PERMISSION.MANAGE_COMPLAINTS, PERMISSION.VIEW_ADMIN_PANEL,
];

const AREA_MODERATOR_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.DELETE_ANY_POST, PERMISSION.MODERATE_POSTS,
  PERMISSION.VERIFY_ALERT, PERMISSION.VIEW_ADMIN_PANEL,
];

const SOCIETY_ADMIN_PERMS: PermissionCode[] = [
  PERMISSION.MANAGE_SOCIETY, PERMISSION.MANAGE_VISITORS, PERMISSION.MANAGE_NOTICES,
  PERMISSION.VERIFY_USER, PERMISSION.MANAGE_COMPLAINTS,
  PERMISSION.VIEW_ADMIN_PANEL,
];

const VOLUNTEER_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.CREATE_POST, PERMISSION.CREATE_COMMENT,
  PERMISSION.CREATE_ALERT, PERMISSION.VIEW_SOS,
];

const PROPERTY_OWNER_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.CREATE_POST, PERMISSION.CREATE_COMMENT,
  PERMISSION.CREATE_PROPERTY,
];

const EMPLOYER_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.CREATE_POST, PERMISSION.CREATE_COMMENT,
  PERMISSION.CREATE_JOB, PERMISSION.MANAGE_CANDIDATES,
];

const SERVICE_PROVIDER_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.CREATE_POST, PERMISSION.CREATE_COMMENT,
  PERMISSION.CREATE_SERVICE, PERMISSION.MANAGE_BOOKINGS,
];

const BUSINESS_OWNER_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.CREATE_POST, PERMISSION.CREATE_COMMENT,
  PERMISSION.CREATE_BUSINESS, PERMISSION.MANAGE_OWN_BUSINESS,
];

const VERIFIED_RESIDENT_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.CREATE_POST, PERMISSION.CREATE_COMMENT,
  PERMISSION.UPDATE_OWN_POST, PERMISSION.DELETE_OWN_POST,
  PERMISSION.CREATE_LISTING, PERMISSION.CREATE_ALERT,
  PERMISSION.REQUEST_VERIFICATION,
];

const RESIDENT_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST, PERMISSION.CREATE_POST, PERMISSION.CREATE_COMMENT,
  PERMISSION.UPDATE_OWN_POST, PERMISSION.DELETE_OWN_POST,
  PERMISSION.CREATE_LISTING, PERMISSION.REQUEST_VERIFICATION,
];

const GUEST_PERMS: PermissionCode[] = [
  PERMISSION.VIEW_POST,
];

export const ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  [ROLE.GUEST]: GUEST_PERMS,
  [ROLE.RESIDENT]: RESIDENT_PERMS,
  [ROLE.VERIFIED_RESIDENT]: VERIFIED_RESIDENT_PERMS,
  [ROLE.BUSINESS_OWNER]: BUSINESS_OWNER_PERMS,
  [ROLE.SERVICE_PROVIDER]: SERVICE_PROVIDER_PERMS,
  [ROLE.EMPLOYER]: EMPLOYER_PERMS,
  [ROLE.PROPERTY_OWNER]: PROPERTY_OWNER_PERMS,
  [ROLE.VOLUNTEER]: VOLUNTEER_PERMS,
  [ROLE.SOCIETY_ADMIN]: SOCIETY_ADMIN_PERMS,
  [ROLE.AREA_MODERATOR]: AREA_MODERATOR_PERMS,
  [ROLE.CITY_MODERATOR]: CITY_MODERATOR_PERMS,
  [ROLE.BUSINESS_ADMIN]: BUSINESS_ADMIN_PERMS,
  [ROLE.ORG_ADMIN]: ORG_ADMIN_PERMS,
  [ROLE.SUPPORT_ADMIN]: SUPPORT_ADMIN_PERMS,
  [ROLE.OPERATIONS_ADMIN]: OPERATIONS_ADMIN_PERMS,
  [ROLE.REVENUE_ADMIN]: REVENUE_ADMIN_PERMS,
  [ROLE.COMPLIANCE_ADMIN]: COMPLIANCE_ADMIN_PERMS,
  [ROLE.SUPER_ADMIN]: SUPER_ADMIN_PERMS,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a set of role codes grants a given permission. */
export function hasPermission(roleCodes: RoleCode[], permission: PermissionCode): boolean {
  return roleCodes.some((rc) => ROLE_PERMISSIONS[rc]?.includes(permission));
}

/** Check if a user holds ANY of the given roles. */
export function hasAnyRole(userRoles: RoleCode[], required: RoleCode[]): boolean {
  return required.some((r) => userRoles.includes(r));
}

/** Check if a user holds at least a given admin level (inclusive). */
export function hasAdminLevel(userRoles: RoleCode[], minLevel: number): boolean {
  return userRoles.some((rc) => {
    const meta = ROLE_META[rc];
    return meta?.category === "ADMIN" && meta.level >= minLevel;
  });
}

/** Is the user a super admin? */
export function isSuperAdmin(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes(ROLE.SUPER_ADMIN);
}

/** Is the user any kind of admin? */
export function isAdmin(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((rc) => ROLE_META[rc]?.category === "ADMIN");
}

/** Get the highest admin level (0 if none). */
export function highestAdminLevel(roleCodes: RoleCode[]): number {
  return Math.max(0, ...roleCodes.map((rc) => ROLE_META[rc]?.level ?? 0));
}

/** Return all permissions granted by a set of roles (deduped). */
export function effectivePermissions(roleCodes: RoleCode[]): PermissionCode[] {
  const set = new Set<PermissionCode>();
  for (const rc of roleCodes) {
    for (const p of ROLE_PERMISSIONS[rc] ?? []) set.add(p);
  }
  return [...set];
}
