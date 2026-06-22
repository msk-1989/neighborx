/**
 * GET /api/admin/stats?uid=<adminUserId>
 * Aggregate platform-wide counts + recent activity feed.
 * Requires VIEW_ADMIN_PANEL permission.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/iam/server";
import { PERMISSION } from "@/lib/iam/roles";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requirePermission(uid, PERMISSION.VIEW_ADMIN_PANEL);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [
      users, posts, businesses, services, jobs, listings,
      emergencies, complaints, groups, events, watchAlerts,
      pendingVerifications, pendingReports, openTickets,
      successfulPayments,
    ] = await Promise.all([
      db.user.count(),
      db.post.count(),
      db.business.count(),
      db.service.count(),
      db.job.count(),
      db.listing.count(),
      db.emergency.count(),
      db.complaint.count(),
      db.group.count(),
      db.event.count(),
      db.watchAlert.count(),
      db.verificationRequest.count({ where: { status: "PENDING" } }),
      db.abuseReport.count({ where: { status: { in: ["PENDING", "REVIEWING"] } } }),
      db.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      db.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    ]);

    const [recentPosts, recentUsers, recentReports] = await Promise.all([
      db.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { author: true },
      }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, avatar: true, createdAt: true, tier: true, role: true },
      }),
      db.abuseReport.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { reporter: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return NextResponse.json({
      stats: {
        users,
        posts,
        businesses,
        services,
        jobs,
        listings,
        emergencies,
        complaints,
        groups,
        events,
        watchAlerts,
        pendingVerifications,
        pendingReports,
        openTickets,
        revenue: successfulPayments._sum.amount ?? 0,
      },
      recent: {
        posts: recentPosts,
        users: recentUsers,
        reports: recentReports,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
