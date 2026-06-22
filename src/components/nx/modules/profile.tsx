"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { verificationBadges } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Smartphone,
  Mail,
  IdCard,
  Home,
  Building2,
  Award,
  Heart,
  Users,
  Star,
  Gift,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LEVELS = [
  { level: 1, key: "verifyMobile", label: "Mobile OTP", icon: Smartphone, emoji: "📱", desc: "Phone number confirmed via OTP" },
  { level: 2, key: "verifyEmail", label: "Email", icon: Mail, emoji: "✉", desc: "Email address confirmed" },
  { level: 3, key: "verifyAadhaar", label: "Aadhaar", icon: IdCard, emoji: "🪪", desc: "Identity verified via Aadhaar" },
  { level: 4, key: "verifyAddress", label: "Address", icon: Home, emoji: "🏠", desc: "Home address verified" },
  { level: 5, key: "verifyBusiness", label: "Business", icon: Building2, emoji: "🏢", desc: "Business ownership verified" },
] as const;

export function Profile({ user: initial }: { user: User }) {
  const [user, setUser] = React.useState(initial);
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState({ name: initial.name, bio: initial.bio || "", phone: initial.phone || "", area: initial.area, society: initial.society });

  async function toggleVerify(key: keyof User) {
    const next = { ...user, [key]: !user[key as keyof User] };
    await api(`/api/me?id=${user.id}`, { method: "PATCH", body: JSON.stringify(next) });
    setUser(next);
    const lvl = LEVELS.find((l) => l.key === key);
    toast.success(`${lvl?.label} verification ${next[key as keyof User] ? "completed" : "removed"} ${lvl?.emoji}`);
  }

  async function saveProfile() {
    const next = await api<User>(`/api/me?id=${user.id}`, { method: "PATCH", body: JSON.stringify(form) });
    setUser(next);
    setEditing(false);
    toast.success("Profile updated");
  }

  const activeLevels = LEVELS.filter((l) => user[l.key as keyof User] as boolean).length;
  const trustScore = Math.round((activeLevels / 5) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* identity card */}
      <Card className="overflow-hidden">
        <div className="brand-gradient h-24" />
        <div className="px-4 pb-4">
          <div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              <Avatar className="h-20 w-20 border-4 border-card">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-xl font-bold bg-primary/15 text-primary">{user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <div className="text-lg font-bold">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
                <Badge className="mt-1 bg-accent text-accent-foreground hover:bg-accent">{user.role.replace(/_/g, " ")}</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>{editing ? "Cancel" : "Edit Profile"}</Button>
          </div>

          {editing ? (
            <div className="mt-4 space-y-3 rounded-lg border p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
              </div>
              <Input value={form.society} onChange={(e) => setForm({ ...form, society: e.target.value })} placeholder="Society" />
              <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Area" />
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" className="min-h-[60px]" />
              <Button size="sm" onClick={saveProfile}>Save</Button>
            </div>
          ) : (
            <>
              {user.bio && <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="gap-1"><Home className="h-3 w-3" /> {user.society}, {user.area}</Badge>
                <Badge variant="outline" className="gap-1"><Star className="h-3 w-3" /> {user.city}, {user.state}</Badge>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* trust score */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Trust Score</div>
              <div className="text-xs text-muted-foreground">{activeLevels}/5 verification levels complete</div>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-primary">{trustScore}%</div>
        </div>
        <Progress value={trustScore} className="mt-3 h-2" />
      </Card>

      {/* verification levels */}
      <Card className="p-4">
        <div className="mb-3 font-semibold">Verification Levels</div>
        <div className="space-y-2">
          {LEVELS.map((l) => {
            const done = user[l.key as keyof User] as boolean;
            const Icon = l.icon;
            return (
              <div key={l.level} className={cn("flex items-center gap-3 rounded-lg border p-3 transition-colors", done && "border-primary/30 bg-primary/5")}>
                <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">Level {l.level}: {l.label}</span>
                    <span>{l.emoji}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{l.desc}</div>
                </div>
                {done ? (
                  <Badge className="gap-1 bg-primary/15 text-primary"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
                ) : (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toggleVerify(l.key as keyof User)}>
                    <Lock className="h-3.5 w-3.5" /> Verify
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* rewards */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500/15 text-amber-600"><Award className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Community Rewards</div>
              <div className="text-xs text-muted-foreground">Earn points by helping your neighborhood</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-amber-600">{user.rewardPoints}</div>
            <div className="text-[10px] text-muted-foreground">points</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 p-2.5">
            <Heart className="mx-auto h-4 w-4 text-rose-500" />
            <div className="mt-1 text-sm font-bold">23</div>
            <div className="text-[10px] text-muted-foreground">Helpful posts</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5">
            <Users className="mx-auto h-4 w-4 text-primary" />
            <div className="mt-1 text-sm font-bold">5</div>
            <div className="text-[10px] text-muted-foreground">Referrals</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5">
            <Gift className="mx-auto h-4 w-4 text-amber-500" />
            <div className="mt-1 text-sm font-bold">₹150</div>
            <div className="text-[10px] text-muted-foreground">Cashback earned</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
