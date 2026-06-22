import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cat = url.searchParams.get("category");
  const services = await db.service.findMany({
    where: cat && cat !== "ALL" ? { category: cat } : {},
    orderBy: [{ verified: "desc" }, { rating: "desc" }],
  });
  return NextResponse.json(services);
}
