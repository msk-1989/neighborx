/**
 * GET /api/admin/payments?uid=
 * All payments with user. Requires VIEW_REVENUE (or VIEW_ADMIN_PANEL).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAnyPermission } from "@/lib/iam/server";
import { PERMISSION } from "@/lib/iam/roles";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  try {
    await requireAnyPermission(uid, [
      PERMISSION.VIEW_REVENUE,
      PERMISSION.VIEW_ADMIN_PANEL,
    ]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [payments, agg] = await Promise.all([
      db.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      db.payment.groupBy({
        by: ["status"],
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Reshape the aggregation into a friendly stats object
    const stats: Record<string, { sum: number; count: number }> = {};
    for (const r of agg) {
      stats[r.status] = { sum: r._sum.amount ?? 0, count: r._count };
    }
    const totalRevenue = stats["SUCCESS"]?.sum ?? 0;
    const totalSuccessful = stats["SUCCESS"]?.count ?? 0;
    const totalPending = stats["PENDING"]?.count ?? 0;
    const totalRefunded = stats["REFUNDED"]?.count ?? 0;

    return NextResponse.json({
      payments,
      stats: {
        totalRevenue,
        totalSuccessful,
        totalPending,
        totalRefunded,
        breakdown: stats,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
