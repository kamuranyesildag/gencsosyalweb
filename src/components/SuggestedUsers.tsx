import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { fetchApi } from "../lib/api";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "./ui/Toast";
import { 
  UserPlus, 
  Check, 
  X, 
  Users, 
  Sparkles, 
  BadgeCheck, 
  RotateCw, 
  FolderGit2, 
  Hash 
} from "lucide-react";
import { Skeleton } from "./ui/Skeleton";

export interface SuggestedUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  avatar?: string | null;
  bio?: string | null;
  isVerified?: boolean;
  mutualFollowers?: number;
  reason?: string;
  commonCommunities?: number;
  commonInterests?: string[];
}

interface SuggestedUsersProps {
  onFollowChange?: () => void;
  limit?: number;
  className?: string;
}

const DISMISSED_STORAGE_KEY = "gencsosyal_dismissed_suggestions";

function getDismissedIds(): number[] {
  try {
    const stored = sessionStorage.getItem(DISMISSED_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDismissedId(id: number) {
  try {
    const current = getDismissedIds();
    if (!current.includes(id)) {
      current.push(id);
      sessionStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(current));
    }
  } catch {
    // ignore sessionStorage errors
  }
}

export function SuggestedUsers({ onFollowChange, limit = 5, className = "" }: SuggestedUsersProps) {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
  const [pendingMap, setPendingMap] = useState<Record<number, boolean>>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dismissed = getDismissedIds();
      const excludeQuery = dismissed.length > 0 ? `&exclude=${dismissed.join(",")}` : "";
      
      let res = await fetchApi(`/users/suggestions?limit=${limit}${excludeQuery}`);
      
      // Fallback to /onboarding/suggested-users if needed
      if (!res.ok && res.status === 404) {
        res = await fetchApi("/onboarding/suggested-users");
      }

      const json = await res.json();
      if (json.success && json.data) {
        const list = Array.isArray(json.data) ? json.data : json.data.users || [];
        setUsers(list);
      } else {
        setError(json.error?.message || "Öneriler yüklenemedi.");
      }
    } catch (err: any) {
      console.error("Error fetching suggestions:", err);
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFollow = async (userId: number) => {
    const isCurrentlyFollowing = followingMap[userId] || false;
    const nextState = !isCurrentlyFollowing;

    // Optimistic UI update
    setFollowingMap((prev) => ({ ...prev, [userId]: nextState }));
    setPendingMap((prev) => ({ ...prev, [userId]: true }));

    try {
      const res = await fetchApi(`/users/${userId}/follow`, {
        method: nextState ? "POST" : "DELETE",
        data: nextState ? { followingId: userId } : undefined,
      });

      if (!res.ok) {
        throw new Error("Takip işlemi gerçekleştirilemedi.");
      }

      toast.success(nextState ? "Takip ediliyor" : "Takipten çıkıldı");
      if (onFollowChange) onFollowChange();

      // If followed successfully, save to dismissed so they aren't recommended again
      if (nextState) {
        saveDismissedId(userId);
      }
    } catch (e: any) {
      // Revert optimistic state
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }));
      toast.error("İşlem başarısız oldu. Lütfen tekrar deneyin.");
    } finally {
      setPendingMap((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDismiss = (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    saveDismissedId(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Helper to render reason icon
  const getReasonIcon = (reason?: string) => {
    if (!reason) return <Sparkles className="w-3 h-3 text-slate-500 shrink-0" />;
    if (reason.includes("ortak takip")) {
      return <Users className="w-3 h-3 text-slate-900 dark:text-indigo-400 shrink-0" />;
    }
    if (reason.includes("topluluğundan")) {
      return <FolderGit2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    if (reason.includes("ilgileniyor")) {
      return <Hash className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />;
    }
    if (reason.includes("Onaylı")) {
      return <BadgeCheck className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />;
    }
    return <Sparkles className="w-3 h-3 text-slate-500 shrink-0" />;
  };

  // 1. Loading State: Clean Skeletons
  if (loading) {
    return (
      <div className={`space-y-3.5 ${className}`} role="status" aria-label="Takip önerileri yükleniyor">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-2.5 w-16 rounded-md" />
              <Skeleton className="h-2.5 w-32 rounded-md" />
            </div>
            <Skeleton className="h-8 w-18 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State with Retry
  if (error) {
    return (
      <div className={`p-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 ${className}`}>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2.5">
          Öneriler yüklenirken bir sorun oluştu.
        </p>
        <button
          type="button"
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
        >
          <RotateCw className="w-3 h-3" />
          Yeniden Dene
        </button>
      </div>
    );
  }

  // 3. Empty State: Graceful, friendly message
  if (users.length === 0) {
    return (
      <div className={`p-5 text-center rounded-2xl bg-slate-50/70 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 ${className}`}>
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
          <Users className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Şu anda yeni takip önerisi bulunamadı.
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Daha fazla kişiyi keşfetmek için arama yapabilirsin.
        </p>
      </div>
    );
  }

  // 4. Recommendation Cards List
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <AnimatePresence mode="popLayout">
        {users.map((user) => {
          const isFollowing = followingMap[user.id] || false;
          const isPending = pendingMap[user.id] || false;

          return (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="group relative flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/70 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-all"
            >
              {/* Dismiss button (X) */}
              <button
                type="button"
                onClick={(e) => handleDismiss(user.id, e)}
                aria-label={`${user.username} önerisini gizle`}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all z-10"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Profile info link */}
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center gap-3 min-w-0 flex-1 pr-2 focus:outline-none"
              >
                <div className="relative shrink-0">
                  <Avatar
                    url={user.avatarUrl || user.avatar}
                    name={user.displayName || user.username}
                    size="md"
                    className="ring-1 ring-slate-200/80 dark:ring-slate-700/80"
                  />
                  {user.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-sky-500 text-white rounded-full p-0.5 ring-2 ring-white dark:ring-slate-900">
                      <BadgeCheck className="w-2.5 h-2.5 fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                      {user.displayName || user.username}
                    </p>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    @{user.username}
                  </p>

                  {/* Recommendation signal reason */}
                  {user.reason && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                      {getReasonIcon(user.reason)}
                      <span className="truncate">{user.reason}</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Follow button */}
              <Button
                variant={isFollowing ? "outline" : "primary"}
                size="sm"
                disabled={isPending}
                onClick={() => handleFollow(user.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all min-h-[36px] ${
                  isFollowing
                    ? "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 hover:border-rose-300"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs"
                }`}
                leftIcon={
                  isFollowing ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )
                }
              >
                {isFollowing ? "Takipte" : "Takip Et"}
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
