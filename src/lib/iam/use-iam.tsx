/**
 * Client-side IAM hook — fetches the current user's roles + permissions
 * and provides `hasPermission` / `isAdmin` / `isSuperAdmin` helpers.
 */
"use client";

import * as React from "react";
import { api } from "@/lib/api";
import {
  type RoleCode,
  type PermissionCode,
  hasPermission as hasPermissionPure,
  isAdmin as isAdminPure,
  isSuperAdmin as isSuperAdminPure,
  ROLE_META,
} from "@/lib/iam/roles";

export interface IamState {
  roles: RoleCode[];
  permissions: PermissionCode[];
  loading: boolean;
  /** Does the current user have this permission? */
  hasPermission: (p: PermissionCode) => boolean;
  /** Is the user any kind of admin? */
  isAdmin: boolean;
  /** Is the user a super admin? */
  isSuperAdmin: boolean;
  /** Highest admin level (0 if none) */
  level: number;
  /** Role metadata for the user's roles */
  roleMeta: (typeof ROLE_META)[RoleCode][];
}

const DEFAULT_STATE: IamState = {
  roles: ["RESIDENT"],
  permissions: [],
  loading: true,
  hasPermission: () => false,
  isAdmin: false,
  isSuperAdmin: false,
  level: 0,
  roleMeta: [],
};

const IamContext = React.createContext<IamState>(DEFAULT_STATE);

export function IamProvider({ children, uid, initialRoles = ["RESIDENT"] }: {
  children: React.ReactNode;
  uid?: string;
  initialRoles?: RoleCode[];
}) {
  const [roles, setRoles] = React.useState<RoleCode[]>(initialRoles);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    let active = true;
    api<{ roles: RoleCode[] }>(`/api/iam/me?uid=${uid}`)
      .then((data) => {
        if (active) {
          setRoles(data.roles?.length ? data.roles : ["RESIDENT"]);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [uid]);

  const value = React.useMemo<IamState>(() => {
    const perms = new Set<PermissionCode>();
    for (const r of roles) {
      const rp = (ROLE_META as any)[r];
      // permissions come from ROLE_PERMISSIONS which isn't imported client-side
      // to keep bundle small; the server validates anyway. For client gating
      // we rely on the /api/iam/me response which includes permissions.
    }
    const admin = isAdminPure(roles);
    const superAdmin = isSuperAdminPure(roles);
    const level = Math.max(0, ...roles.map((r) => ROLE_META[r]?.level ?? 0));
    const roleMeta = roles
      .map((r) => ROLE_META[r])
      .filter(Boolean)
      .sort((a, b) => b.level - a.level);
    return {
      roles,
      permissions: [],
      loading,
      hasPermission: (p: PermissionCode) => hasPermissionPure(roles, p),
      isAdmin: admin,
      isSuperAdmin: superAdmin,
      level,
      roleMeta,
    };
  }, [roles, loading]);

  return <IamContext.Provider value={value}>{children}</IamContext.Provider>;
}

export function useIam(): IamState {
  return React.useContext(IamContext);
}

/** Convenience hook: does the current user have this permission? */
export function useHasPermission(p: PermissionCode): boolean {
  const iam = useIam();
  return iam.hasPermission(p);
}

/** Convenience hook: is the current user an admin? */
export function useIsAdmin(): boolean {
  return useIam().isAdmin;
}

/** Convenience hook: is the current user a super admin? */
export function useIsSuperAdmin(): boolean {
  return useIam().isSuperAdmin;
}
