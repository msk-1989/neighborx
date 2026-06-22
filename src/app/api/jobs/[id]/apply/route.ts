import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const body = await req.json();
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") || "arjun@nx.in";
  const user = await db.user.findFirst({ where: { OR: [{ id: uid }, { email: uid }] } });
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const app = await db.jobApplication.create({
    data: { jobId, applicantId: user.id, cover: body.cover || null },
    include: { applicant: true },
  });
  return NextResponse.json(app);
}
