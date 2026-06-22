import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cat = url.searchParams.get("category");
  const q = url.searchParams.get("q");
  const businesses = await db.business.findMany({
    where: {
      AND: [
        cat && cat !== "ALL" ? { category: cat } : {},
        q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {},
      ],
    },
    orderBy: [{ featured: "desc" }, { rating: "desc" }],
  });
  return NextResponse.json(businesses);
}
