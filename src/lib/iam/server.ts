/**
 * Server-side RBAC helpers — query the DB for a user's roles and check
 * permissions. Used by API routes and server components.
 *
 * IMPORTANT: This module imports @/lib/db (Prisma) which is server-only.
 * Do not import this from client components.
 */
import { db } from "@/lib/db";
import {
  type RoleCode,
  type PermissionCode,
  hasPermission as hasPermissionPure,
  isAdmin as isAdminPure,
  isSuperAdmin as isSuperAdminPure,
  effectivePermissions,
} from "./roles";

/** Fetch all role codes for a user (from the UserRole table). */
export async function getUserRoleCodes(userId: string): Promise<RoleCode[]> {
  const userRoles = await db.userRole.findMany({
    where: { userId },
    include: { role: { select: { code: true } } },
  });
  // Always include RESIDENT as a baseline for logged-in users
  const codes = userRoles
    .map((ur) => ur.role.code as RoleCode)
    .filter(Boolean);
  if (!codes.includes("RESIDENT")) codes.push("RESIDENT");
  return codes;
}

/** Does the user have a specific permission? */
export async function userHasPermission(
  userId: string,
  permission: PermissionCode,
): Promise<boolean> {
  const roles = await getUserRoleCodes(userId);
  return hasPermissionPure(roles, permission);
}

/** Is the user any kind of admin? */
export async function userIsAdmin(userId: string): Promise<boolean> {
  const roles = await getUserRoleCodes(userId);
  return isAdminPure(roles);
}

/** Is the user a super admin? */
export async function userIsSuperAdmin(userId: string): Promise<boolean> {
  const roles = await getUserRoleCodes(userId);
  return isSuperAdminPure(roles);
}

/** Get all effective permissions for a user. */
export async function getUserPermissions(
  userId: string,
): Promise<PermissionCode[]> {
  const roles = await getUserRoleCodes(userId);
  return effectivePermissions(roles);
}

/** Require a permission — throws 403-ish error if missing. */
export async function requirePermission(
  userId: string,
  permission: PermissionCode,
): Promise<void> {
  const ok = await userHasPermission(userId, permission);
  if (!ok) {
    throw new Error(
      `Forbidden: missing permission ${permission}`,
    );
  }
}

/** Require ANY of the given permissions. */
export async function requireAnyPermission(
  userId: string,
  permissions: PermissionCode[],
): Promise<void> {
  const roles = await getUserRoleCodes(userId);
  const ok = permissions.some((p) => hasPermissionPure(roles, p));
  if (!ok) {
    throw new Error(
      `Forbidden: missing one of ${permissions.join(", ")}`,
    );
  }
}

/** Assign a role to a user (with optional scope + grantedBy). */
export async function assignRole(
  userId: string,
  roleCode: RoleCode,
  opts?: { scope?: string; grantedBy?: string },
): Promise<void> {
  const role = await db.role.findUnique({ where: { code: roleCode } });
  if (!role) throw new Error(`Role ${roleCode} not found`);
  // scope is null for global roles — Prisma compound unique with nullable field
  // doesn't allow upsert with null, so use deleteMany + create pattern.
  await db.userRole.deleteMany({
    where: { userId, roleId: role.id, scope: opts?.scope ?? null },
  });
  await db.userRole.create({
    data: {
      userId,
      roleId: role.id,
      scope: opts?.scope,
      grantedBy: opts?.grantedBy,
    },
  });
}

/** Remove a role from a user. */
export async function removeRole(
  userId: string,
  roleCode: RoleCode,
  scope?: string | null,
): Promise<void> {
  const role = await db.role.findUnique({ where: { code: roleCode } });
  if (!role) return;
  await db.userRole.deleteMany({
    where: {
      userId,
      roleId: role.id,
      scope: scope ?? null,
    },
  });
}
