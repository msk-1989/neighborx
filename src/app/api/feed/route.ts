import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function currentUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("uid") || "arjun@nx.in";
  return db.user.findFirst({ where: { OR: [{ id }, { email: id }] } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope"); // SOCIETY | AREA | CITY
  const posts = await db.post.findMany({
    where: scope ? { scope } : undefined,
    include: { author: true, comments: { include: { author: true }, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });
  const post = await db.post.create({
    data: {
      type: body.type || "TEXT",
      content: body.content,
      imageUrl: body.imageUrl || null,
      pollData: body.pollData || null,
      scope: body.scope || "AREA",
      tag: body.tag || null,
      authorId: user.id,
    },
    include: { author: true, comments: { include: { author: true } } },
  });
  return NextResponse.json(post);
}

// actions: like / comment / vote
export async function PATCH(req: Request) {
  const body = await req.json();
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  if (body.action === "like") {
    const post = await db.post.update({
      where: { id: body.postId },
      data: { likes: { increment: 1 } },
      include: { author: true, comments: { include: { author: true } } },
    });
    return NextResponse.json(post);
  }

  if (body.action === "comment") {
    const c = await db.comment.create({
      data: { content: body.content, postId: body.postId, authorId: user.id },
      include: { author: true },
    });
    return NextResponse.json(c);
  }

  if (body.action === "vote") {
    const post = await db.post.findUnique({ where: { id: body.postId } });
    if (!post || !post.pollData) return NextResponse.json({ error: "no poll" }, { status: 400 });
    const poll = JSON.parse(post.pollData);
    poll.options[body.optionIndex].votes += 1;
    const updated = await db.post.update({
      where: { id: body.postId },
      data: { pollData: JSON.stringify(poll) },
      include: { author: true, comments: { include: { author: true } } },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
