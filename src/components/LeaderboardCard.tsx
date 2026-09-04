import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { Avatar } from "./ui/Avatar";
import { Link } from "react-router";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { VerifiedBadge } from "./VerifiedBadge";

export function LeaderboardCard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/gamification/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLeaderboard(d.data.leaderboard || []);
          setMyRank(d.data.myRank);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0D121D] rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] flex justify-center py-6">
        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <section
        aria-label="Haftanın Üretenleri"
        className="bg-white dark:bg-[#0D121D] rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs text-center"
      >
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Haftanın Üretenleri</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
          Bu haftanın sıralaması yeni başladı. Paylaşım yaparak zirvedeki yerini al!
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Haftanın Üretenleri"
      className="bg-white dark:bg-[#0D121D] rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Haftanın Üretenleri
        </h3>
      </div>

      <div className="space-y-1.5">
        {leaderboard.slice(0, 5).map((entry, index) => {
          return (
            <div
              key={entry.user.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-xl transition-all",
                index === 0
                  ? "bg-amber-50/60 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/30"
                  : index === 1
                  ? "bg-slate-50/80 border border-slate-200/60 dark:bg-white/[0.03] dark:border-white/[0.06]"
                  : index === 2
                  ? "bg-orange-50/50 border border-orange-200/50 dark:bg-orange-950/15 dark:border-orange-900/20"
                  : "bg-transparent border border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    "w-5 text-center text-xs font-bold shrink-0",
                    index === 0
                      ? "text-amber-600 dark:text-amber-400"
                      : index === 1
                      ? "text-slate-600 dark:text-slate-400"
                      : index === 2
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {index === 0 ? "1" : index === 1 ? "2" : index === 2 ? "3" : `${index + 1}`}
                </span>

                <Link
                  to={`/profile/${entry.user.username}`}
                  className="flex items-center gap-2 min-w-0 group/user"
                >
                  <Avatar
                    url={entry.user.avatarUrl}
                    name={entry.user.displayName || entry.user.username}
                    size="sm"
                    className="w-7 h-7"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover/user:text-blue-600 dark:group-hover/user:text-blue-400 transition-colors">
                        {entry.user.displayName || entry.user.username}
                      </span>
                      {entry.user.isVerified && (
                        <VerifiedBadge iconClassName="w-3 h-3 text-blue-500" withModal={false} />
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {entry.score} XP
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {myRank && myRank.rank > 5 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] text-center">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Sen <strong className="text-slate-900 dark:text-slate-200">#{myRank.rank}.</strong> sıradasın ({myRank.score} XP)
          </span>
        </div>
      )}
    </section>
  );
}
