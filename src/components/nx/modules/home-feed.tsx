"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types";
import { timeAgo, verificationBadges } from "@/lib/types";
import { useNX } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Image as ImageIcon,
  BarChart3,
  Send,
  Flag,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../user-bits";

const SCOPES = [
  { key: "SOCIETY", label: "Society" },
  { key: "AREA", label: "Area" },
  { key: "CITY", label: "City" },
];

export function HomeFeed({ uid }: { uid: string }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [composer, setComposer] = React.useState("");
  const [imgUrl, setImgUrl] = React.useState("");
  const [showImg, setShowImg] = React.useState(false);
  const [scope, setScope] = React.useState("AREA");
  const [posting, setPosting] = React.useState(false);
  const nb = useNX((s) => s.neighborhood);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Post[]>(`/api/feed?scope=${nb.scope}&uid=${uid}`);
      setPosts(data);
    } catch {
      toast.error("Could not load feed");
    } finally {
      setLoading(false);
    }
  }, [nb.scope, uid]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!composer.trim()) return;
    setPosting(true);
    try {
      const post = await api<Post>(`/api/feed?uid=${uid}`, {
        method: "POST",
        body: JSON.stringify({
          type: showImg && imgUrl ? "IMAGE" : "TEXT",
          content: composer,
          imageUrl: showImg && imgUrl ? imgUrl : null,
          scope,
        }),
      });
      setPosts((p) => [post, ...p]);
      setComposer("");
      setImgUrl("");
      setShowImg(false);
      toast.success("Posted to your neighborhood 🎉");
    } catch {
      toast.error("Failed to post");
    } finally {
      setPosting(false);
    }
  }

  async function like(id: string) {
    try {
      const p = await api<Post>(`/api/feed?uid=${uid}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "like", postId: id }),
      });
      setPosts((arr) => arr.map((x) => (x.id === id ? p : x)));
    } catch {}
  }

  async function comment(id: string, text: string) {
    const c = await api<Post["comments"][number]>(`/api/feed?uid=${uid}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "comment", postId: id, content: text }),
    });
    setPosts((arr) =>
      arr.map((x) =>
        x.id === id ? { ...x, comments: [...x.comments, c] } : x
      )
    );
  }

  async function vote(id: string, optionIndex: number) {
    const p = await api<Post>(`/api/feed?uid=${uid}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "vote", postId: id, optionIndex }),
    });
    setPosts((arr) => arr.map((x) => (x.id === id ? p : x)));
    toast.success("Vote recorded 🗳️");
  }

  return (
    <div className="space-y-4">
      {/* composer */}
      <Card className="p-4">
        <div className="flex gap-3">
          <UserAvatar user={{ name: "You", avatar: undefined }} />
          <div className="flex-1 space-y-3">
            <Textarea
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder={`Share something with ${nb.society}...`}
              className="min-h-[80px] resize-none border-0 bg-muted/40 focus-visible:ring-1"
            />
            {showImg && (
              <Input
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="Paste image URL (https://...)"
                className="h-9"
              />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImg((s) => !s)}
                  className="text-muted-foreground"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Photo</span>
                </Button>
                <div className="ml-1 flex items-center gap-1 rounded-md bg-muted p-0.5">
                  {SCOPES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setScope(s.key)}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                        scope === s.key
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                onClick={submit}
                disabled={!composer.trim() || posting}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {posting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* posts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No posts in this scope yet. Be the first to share!
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onLike={() => like(p.id)}
              onComment={(t) => comment(p.id, t)}
              onVote={(i) => vote(p.id, i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  onLike,
  onComment,
  onVote,
}: {
  post: Post;
  onLike: () => void;
  onComment: (t: string) => void;
  onVote: (i: number) => void;
}) {
  const [showComments, setShowComments] = React.useState(false);
  const [cmt, setCmt] = React.useState("");
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const badges = verificationBadges(post.author).filter((b) => b.active);
  const isPoll = post.type === "POLL";
  const poll = isPoll && post.pollData
    ? (JSON.parse(post.pollData) as {
        question: string;
        options: { text: string; votes: number }[];
      })
    : null;
  const totalVotes = poll
    ? poll.options.reduce((a, b) => a + b.votes, 0)
    : 0;

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <UserAvatar user={post.author} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-semibold text-sm">{post.author.name}</span>
              <span className="text-xs text-muted-foreground">
                · {post.author.society}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{timeAgo(post.createdAt)}</span>
              <span>·</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {post.scope}
              </Badge>
              {post.tag && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  {post.tag}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
            <Flag className="h-3.5 w-3.5" />
          </Button>
        </div>

        <p className="mt-3 text-sm whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="mt-3 overflow-hidden rounded-lg border">
            <img
              src={post.imageUrl}
              alt=""
              className="max-h-96 w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {poll && (
          <div className="mt-3 space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">
              {totalVotes} votes
            </div>
            {poll.options.map((o, i) => {
              const pct = totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0;
              return (
                <button
                  key={i}
                  onClick={() => onVote(i)}
                  className="group relative w-full overflow-hidden rounded-md border bg-muted/30 px-3 py-2 text-left text-sm transition-colors hover:border-primary/40"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/15 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="font-medium">{o.text}</span>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 border-t px-2 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLiked((l) => !l);
            if (!liked) onLike();
          }}
          className={cn("gap-1.5 text-muted-foreground", liked && "text-destructive")}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          <span className="text-xs">{post.likes + (liked ? 1 : 0)}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments((s) => !s)}
          className="gap-1.5 text-muted-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">{post.comments.length}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.success("Link copied to clipboard")}
          className="gap-1.5 text-muted-foreground"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSaved((s) => !s);
            toast.success(saved ? "Removed from saved" : "Saved");
          }}
          className={cn("ml-auto gap-1.5 text-muted-foreground", saved && "text-primary")}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </Button>
      </div>

      {showComments && (
        <div className="border-t bg-muted/20 p-3 space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <UserAvatar user={c.author} size="h-7 w-7" />
              <div className="flex-1 rounded-lg bg-background px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{c.author.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="text-sm mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={cmt}
              onChange={(e) => setCmt(e.target.value)}
              placeholder="Write a comment..."
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && cmt.trim()) {
                  onComment(cmt);
                  setCmt("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (cmt.trim()) {
                  onComment(cmt);
                  setCmt("");
                }
              }}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
