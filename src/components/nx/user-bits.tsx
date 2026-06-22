"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { verificationBadges } from "@/lib/types";

export function UserAvatar({
  user,
  size = "h-9 w-9",
  showName = false,
}: {
  user: { name: string; avatar?: string | null };
  size?: string;
  showName?: boolean;
}) {
  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn(size)}>
        <AvatarImage src={user.avatar || undefined} alt={user.name} />
        <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showName && <span className="text-sm font-medium">{user.name}</span>}
    </div>
  );
}

export function VerifyBadges({
  user,
  size = "sm",
}: {
  user: {
    verifyMobile: boolean;
    verifyEmail: boolean;
    verifyAadhaar: boolean;
    verifyAddress: boolean;
    verifyBusiness: boolean;
  };
  size?: "xs" | "sm";
}) {
  const badges = verificationBadges(user).filter((b) => b.active);
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {badges.map((b) => (
        <Badge
          key={b.level}
          variant="outline"
          className={cn(
            "gap-1 border-primary/30 bg-primary/5 text-primary",
            size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0 text-[11px]"
          )}
          title={`${b.label} verified (Level ${b.level})`}
        >
          <span>{b.icon}</span>
          <span className="hidden sm:inline">{b.label}</span>
        </Badge>
      ))}
    </div>
  );
}
