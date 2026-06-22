import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cat = url.searchParams.get("category");
  const q = url.searchParams.get("q");
  const jobs = await db.job.findMany({
    where: {
      AND: [
        cat && cat !== "ALL" ? { category: cat } : {},
        q ? { OR: [{ title: { contains: q } }, { company: { contains: q } }] } : {},
      ],
    },
    include: { employer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(jobs);
}
