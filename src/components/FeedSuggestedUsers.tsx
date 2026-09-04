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
  Sparkles,
  Users,
  FolderGit2,
  Hash,
} from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { Skeleton } from "./ui/Skeleton";

export interface FeedSuggestedUser {
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

const DISMISSED_FEED_KEY = "gencsosyal_dismissed_feed_users";
const DISMISSED_SECTION_KEY = "gencsosyal_dismissed_feed_section";

function getDismissedIds(): number[] {
  try {
    const stored = sessionStorage.getItem(DISMISSED_FEED_KEY);
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
      sessionStorage.setItem(DISMISSED_FEED_KEY, JSON.stringify(current));
    }
  } catch {
    // ignore
  }
}

export function FeedSuggestedUsers() {
  const [users, setUsers] = useState<FeedSuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
  const [pendingMap, setPendingMap] = useState<Record<number, boolean>>({});
  const [dismissedSection, setDismissedSection] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISSED_SECTION_KEY) === "true";
    } catch {
      return false;
    }
  });

  const fetchUsers = useCallback(async () => {
    if (dismissedSection) {
      setLoading(false);
      return;
    }

    try {
      const dismissed = getDismissedIds();
      const excludeQuery = dismissed.length > 0 ? `&exclude=${dismissed.join(",")}` : "";

      let res = await fetchApi(`/users/suggestions?limit=8${excludeQuery}`);
      if (!res.ok && res.status === 404) {
        res = await fetchApi("/onboarding/suggested-users");
      }

      const json = await res.json();
      if (json.success && json.data) {
        const list = Array.isArray(json.data) ? json.data : json.data.users || [];
        setUsers(list);
      }
    } catch (error) {
      console.error("Error fetching feed suggestions:", error);
    } finally {
      setLoading(false);
    }
  }, [dismissedSection]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFollow = async (userId: number) => {
    const isCurrentlyFollowing = followingMap[userId] || false;
    const nextState = !isCurrentlyFollowing;

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
      if (nextState) {
        saveDismissedId(userId);
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }));
      toast.error("İşlem başarısız oldu. Lütfen tekrar deneyin.");
    } finally {
      setPendingMap((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDismissUser = (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    saveDismissedId(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleDismissSection = () => {
    setDismissedSection(true);
    try {
      sessionStorage.setItem(DISMISSED_SECTION_KEY, "true");
    } catch {}
  };

  const getReasonIcon = (reason?: string) => {
    if (!reason) return <Sparkles className="w-3 h-3 text-slate-400 shrink-0" />;
    if (reason.includes("ortak takip")) {
      return <Users className="w-3 h-3 text-blue-500 shrink-0" />;
    }
    if (reason.includes("topluluğundan")) {
      return <FolderGit2 className="w-3 h-3 text-emerald-500 shrink-0" />;
    }
    if (reason.includes("ilgileniyor")) {
      return <Hash className="w-3 h-3 text-amber-500 shrink-0" />;
    }
    return <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />;
  };

  if (dismissedSection) return null;
  if (!loading && users.length === 0) return null;

  return (
    <section
      aria-label="Takip Önerileri"
      className="w-full bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 my-2.5 mx-2 sm:mx-4 max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] shadow-2xs relative overflow-hidden transition-colors"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div>
          <h2 className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Takip Edebileceğin Kişiler
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            İlgi alanlarına ve bağlantılarına göre önerilen üreticiler
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismissSection}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Önerileri gizle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[165px] shrink-0 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] rounded-xl p-3.5 flex flex-col items-center"
            >
              <Skeleton className="w-14 h-14 rounded-full mb-2.5" />
              <Skeleton className="h-4 w-20 rounded-md mb-1" />
              <Skeleton className="h-3 w-14 rounded-md mb-2" />
              <Skeleton className="h-7 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* User Cards Carousel */}
      {!loading && users.length > 0 && (
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="flex gap-2.5 min-w-max">
            <AnimatePresence mode="popLayout">
              {users.map((user) => {
                const isFollowing = followingMap[user.id] || false;
                const isPending = pendingMap[user.id] || false;

                return (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="group relative w-[170px] shrink-0 bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] rounded-xl p-3.5 flex flex-col items-center text-center transition-all"
                  >
                    {/* Dismiss user button */}
                    <button
                      type="button"
                      onClick={(e) => handleDismissUser(user.id, e)}
                      aria-label={`${user.username} önerisini gizle`}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all z-10 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Profile Link */}
                    <Link
                      to={`/profile/${user.username}`}
                      className="flex flex-col items-center w-full focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg"
                    >
                      <div className="relative mb-2">
                        <Avatar
                          url={user.avatarUrl || user.avatar}
                          name={user.displayName || user.username}
                          size="md"
                          className="w-12 h-12"
                        />
                      </div>

                      <div className="flex items-center gap-1 justify-center w-full px-1">
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {user.displayName || user.username}
                        </p>
                        {user.isVerified && (
                          <VerifiedBadge
                            iconClassName="w-3 h-3 text-blue-500"
                            withModal={false}
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 w-full truncate mt-0.5">
                        @{user.username}
                      </p>

                      {/* Reason Tag */}
                      <div className="flex items-center justify-center gap-1 mt-1.5 mb-2.5 px-2 py-0.5 max-w-full rounded-md bg-white dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] text-[10px] text-slate-600 dark:text-slate-400 truncate">
                        {getReasonIcon(user.reason)}
                        <span className="truncate">{user.reason || "Önerilen"}</span>
                      </div>
                    </Link>

                    {/* Follow Button */}
                    <Button
                      variant={isFollowing ? "outline" : "primary"}
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleFollow(user.id)}
                      className="w-full rounded-lg text-xs font-semibold py-1.5 min-h-[32px]"
                      leftIcon={
                        isFollowing ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
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
        </div>
      )}
    </section>
  );
}
