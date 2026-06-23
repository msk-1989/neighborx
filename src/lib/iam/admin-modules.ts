/**
 * Role-scoped admin module mapping.
 * ====================================================================
 * Each admin level sees only the modules relevant to their role.
 * Super Admin (level 10) sees all 16 modules; a Society Admin (level 1)
 * sees only society-scoped modules.
 *
 * This is CLIENT-SIDE gating for the UI. The server (/api/admin/* routes)
 * independently validates permissions on every request — a user cannot
 * access data they're not authorized for even if they manipulate the client.
 */

import type { AdminTabKey } from "@/components/nx/modules/admin-panel";
import type { RoleCode } from "@/lib/iam/roles";

/**
 * Maps each admin role to the admin tabs it can access.
 * "overview" is always included — every admin sees the dashboard.
 */
export const ADMIN_ROLE_MODULES: Partial<Record<RoleCode, AdminTabKey[]>> = {
  // Level 10 — full access to everything
  SUPER_ADMIN: [
    "overview", "users", "community", "trust", "marketplace", "businesses",
    "services", "jobs", "property", "safety", "society", "civic",
    "finance", "compliance", "support", "settings",
  ],
  // Level 9 — compliance: abuse reports, content takedown, user suspension
  COMPLIANCE_ADMIN: ["overview", "compliance", "community", "users"],
  // Level 8 — revenue: payments, subscriptions, refunds, payouts
  REVENUE_ADMIN: ["overview", "finance", "businesses", "subscriptions" as AdminTabKey],
  // Level 7 — operations: verifications, support, society management
  OPERATIONS_ADMIN: ["overview", "trust", "support", "society", "users"],
  // Level 6 — support: handle support tickets
  SUPPORT_ADMIN: ["overview", "support", "community"],
  // Level 5 — org: limited overview
  ORG_ADMIN: ["overview"],
  // Level 4 — business admin: manage businesses & services
  BUSINESS_ADMIN: ["overview", "businesses", "services"],
  // Level 3 — city moderator: moderate community + marketplace across the city
  CITY_MODERATOR: ["overview", "community", "marketplace", "events" as AdminTabKey, "jobs"],
  // Level 2 — area moderator: moderate community + marketplace in their area
  AREA_MODERATOR: ["overview", "community", "marketplace"],
  // Level 1 — society admin: manage their society only
  SOCIETY_ADMIN: ["overview", "society", "community", "users"],
};

/**
 * Returns the list of admin tabs visible to the given roles.
 * If the user has multiple admin roles, the union of all allowed tabs is returned.
 * Falls back to ["overview"] if no specific mapping matches.
 */
export function getVisibleAdminTabs(roles: RoleCode[]): AdminTabKey[] {
  const visible = new Set<AdminTabKey>(["overview"]);
  for (const role of roles) {
    const tabs = ADMIN_ROLE_MODULES[role];
    if (tabs) {
      for (const t of tabs) visible.add(t);
    }
  }
  // Preserve the canonical order from ADMIN_TABS
  const allTabs: AdminTabKey[] = [
    "overview", "users", "community", "trust", "marketplace", "businesses",
    "services", "jobs", "property", "safety", "society", "civic",
    "finance", "compliance", "support", "settings",
  ];
  return allTabs.filter((t) => visible.has(t));
}

/**
 * Human-readable role label for the admin shell header.
 */
export function getAdminRoleLabel(roles: RoleCode[]): string {
  const adminRoles = roles.filter((r) => r.endsWith("_ADMIN") || r === "SUPER_ADMIN");
  if (adminRoles.length === 0) return "Admin";
  if (adminRoles.includes("SUPER_ADMIN")) return "Super Admin";
  // Use the highest-level admin role
  const order: RoleCode[] = [
    "COMPLIANCE_ADMIN", "REVENUE_ADMIN", "OPERATIONS_ADMIN", "SUPPORT_ADMIN",
    "ORG_ADMIN", "BUSINESS_ADMIN", "CITY_MODERATOR", "AREA_MODERATOR", "SOCIETY_ADMIN",
  ];
  for (const r of order) {
    if (adminRoles.includes(r)) {
      return r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return "Admin";
}
