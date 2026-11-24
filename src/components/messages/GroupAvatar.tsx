import React from "react";
import { Users } from "lucide-react";
import { cn } from "../../lib/utils";
import type { MessageUserBrief } from "./types";

interface GroupAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  members?: MessageUserBrief[];
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-9 h-9 text-xs rounded-xl",
  md: "w-11 h-11 text-sm rounded-2xl",
  lg: "w-12 h-12 text-base rounded-2xl",
  xl: "w-20 h-20 text-2xl rounded-3xl",
};

export function GroupAvatar({
  avatarUrl,
  name,
  members = [],
  size = "md",
  className,
}: GroupAvatarProps) {
  const safeName = (name || "Grup").trim();
  const initials = safeName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-white/10",
          sizeMap[size],
          className
        )}
      >
        <img
          src={avatarUrl}
          alt={safeName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // If no custom group photo and >= 2 members have avatars, show a crisp split mosaic for md/lg
  const membersWithAvatars = members.filter((m) => m.avatarUrl).slice(0, 2);
  if ((size === "md" || size === "lg") && membersWithAvatars.length >= 2) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-white/10 grid grid-cols-2 gap-px",
          sizeMap[size],
          className
        )}
      >
        {membersWithAvatars.map((m) => (
          <img
            key={m.id}
            src={m.avatarUrl || ""}
            alt={m.displayName || m.username}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center font-extrabold tracking-tight bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs ring-1 ring-blue-500/20 select-none",
        sizeMap[size],
        className
      )}
    >
      {initials || <Users className="w-5 h-5" />}
    </div>
  );
}
