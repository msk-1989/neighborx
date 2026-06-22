/**
 * Seed all IAM roles + permissions + role-permission mappings into the DB.
 * Run via: DIRECT_DATABASE_URL=... bun prisma/seed-iam.ts
 *
 * Idempotent — safe to run multiple times. Uses batched createMany for speed.
 */
import { PrismaClient } from "@prisma/client";
import {
  ROLE_META,
  PERMISSION_META,
  ROLE_PERMISSIONS,
  ALL_ROLE_CODES,
  ALL_PERMISSION_CODES,
} from "../src/lib/iam/roles";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seeding IAM roles + permissions…");

  // 1. Upsert all permissions (batched — delete + recreate is faster on Neon)
  console.log(`  ↳ ${ALL_PERMISSION_CODES.length} permissions…`);
  const permRows = ALL_PERMISSION_CODES.map((code) => {
    const m = PERMISSION_META[code];
    return {
      code,
      name: m.name,
      description: m.description,
      module: m.module,
      action: m.action,
    };
  });
  // Use upsert in a transaction batch for reliability
  await prisma.$transaction(
    permRows.map((p) =>
      prisma.permission.upsert({
        where: { code: p.code },
        create: p,
        update: p,
      }),
    ),
    { timeout: 60000 },
  );

  // 2. Upsert all roles
  console.log(`  ↳ ${ALL_ROLE_CODES.length} roles…`);
  const roleRows = ALL_ROLE_CODES.map((code) => {
    const m = ROLE_META[code];
    return {
      code,
      name: m.name,
      description: m.description,
      level: m.level,
      category: m.category,
      isSystem: true,
    };
  });
  await prisma.$transaction(
    roleRows.map((r) =>
      prisma.role.upsert({
        where: { code: r.code },
        create: r,
        update: r,
      }),
    ),
    { timeout: 60000 },
  );

  // 3. Sync role-permission mappings
  console.log("  ↳ role-permission mappings…");
  const allRoles = await prisma.role.findMany();
  const allPerms = await prisma.permission.findMany();
  const permIdByCode = new Map(allPerms.map((p) => [p.code, p.id]));

  const rpRows: { roleId: string; permissionId: string }[] = [];
  for (const role of allRoles) {
    const permCodes = ROLE_PERMISSIONS[role.code as keyof typeof ROLE_PERMISSIONS] ?? [];
    for (const pc of permCodes) {
      const pid = permIdByCode.get(pc);
      if (pid) rpRows.push({ roleId: role.id, permissionId: pid });
    }
  }
  // Delete all existing role-permissions, then recreate
  await prisma.rolePermission.deleteMany({});
  await prisma.rolePermission.createMany({ data: rpRows, skipDuplicates: true });

  // 4. Give the demo super admin (Arjun) the SUPER_ADMIN role
  const arjun = await prisma.user.findUnique({ where: { email: "arjun@nx.in" } });
  if (arjun) {
    const superAdminRole = await prisma.role.findUnique({ where: { code: "SUPER_ADMIN" } });
    const societyAdminRole = await prisma.role.findUnique({ where: { code: "SOCIETY_ADMIN" } });
    if (superAdminRole) {
      // scope is null for global roles — use deleteMany + create pattern
      await prisma.userRole.deleteMany({
        where: { userId: arjun.id, roleId: superAdminRole.id, scope: null },
      });
      await prisma.userRole.create({
        data: { userId: arjun.id, roleId: superAdminRole.id, grantedBy: "system" },
      });
      console.log("  ↳ granted SUPER_ADMIN to Arjun");
    }
    if (societyAdminRole) {
      await prisma.userRole.deleteMany({
        where: { userId: arjun.id, roleId: societyAdminRole.id, scope: "Royal Residency" },
      });
      await prisma.userRole.create({
        data: {
          userId: arjun.id,
          roleId: societyAdminRole.id,
          scope: "Royal Residency",
          grantedBy: "system",
        },
      });
      console.log("  ↳ granted SOCIETY_ADMIN (Royal Residency) to Arjun");
    }
  }

  // 5. Seed a demo society
  const existingSociety = await prisma.society.findFirst({ where: { name: "Royal Residency" } });
  if (!existingSociety && arjun) {
    await prisma.society.create({
      data: {
        name: "Royal Residency",
        address: "Royal Residency, Khair Nagar, Udgir",
        area: "Khair Nagar",
        city: "Udgir",
        district: "Latur",
        state: "Maharashtra",
        totalUnits: 120,
        adminId: arjun.id,
      },
    });
    console.log("  ↳ created demo society: Royal Residency");
  }

  // 6. Seed demo subscription plans
  console.log("  ↳ subscription plans…");
  const plans = [
    { plan: "FREE", price: 0, features: ["Basic community access", "View feed", "Join 3 groups"] },
    { plan: "BUSINESS_PRO", price: 499, features: ["Verified badge", "Analytics", "Unlimited offers", "Lead management"] },
    { plan: "SERVICE_PRO", price: 299, features: ["Verified badge", "Booking management", "Online payments", "Earnings dashboard"] },
    { plan: "EMPLOYER_PRO", price: 999, features: ["Unlimited job posts", "Candidate management", "Interview scheduling", "Priority listings"] },
    { plan: "SOCIETY_PRO", price: 1999, features: ["Visitor management", "Maintenance tracking", "Notices", "Facility booking"] },
    { plan: "ENTERPRISE", price: 9999, features: ["Everything included", "Dedicated support", "Custom integrations", "SLA"] },
  ];
  await prisma.subscription.deleteMany({});
  await prisma.subscription.createMany({
    data: plans.map((p) => ({
      plan: p.plan,
      price: p.price,
      features: JSON.stringify(p.features),
      billingCycle: "MONTHLY" as const,
      active: true,
    })),
  });

  console.log("✓ IAM seed complete.");
  console.log(`  Roles: ${ALL_ROLE_CODES.length} | Permissions: ${ALL_PERMISSION_CODES.length} | RolePermissions: ${rpRows.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
