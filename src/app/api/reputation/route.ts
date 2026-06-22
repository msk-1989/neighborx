import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/reputation — full reputation hub data for a user
// Returns: user (with tier/points), achievements (all), userAchievements (earned),
//          leaderboard (top users by rewardPoints)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  const [allAchievements, userAchievements, leaderboard] = await Promise.all([
    db.achievement.findMany({ orderBy: { points: "asc" } }),
    uid
      ? db.userAchievement.findMany({
          where: { userId: uid },
          include: { achievement: true },
          orderBy: { earnedAt: "desc" },
        })
      : Promise.resolve([]),
    db.user.findMany({
      orderBy: { rewardPoints: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        avatar: true,
        rewardPoints: true,
        tier: true,
        heroLevel: true,
        society: true,
        area: true,
      },
    }),
  ]);

  const user = uid ? await db.user.findUnique({ where: { id: uid } }) : null;

  return NextResponse.json({
    user,
    allAchievements,
    userAchievements,
    leaderboard,
  });
}
