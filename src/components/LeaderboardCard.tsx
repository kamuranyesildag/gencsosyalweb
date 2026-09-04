import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { Avatar } from "./ui/Avatar";
import { Link } from "react-router";
import { Trophy, Medal, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { VerifiedBadge } from "./VerifiedBadge";

export function LeaderboardCard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/gamification/leaderboard")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setLeaderboard(d.data.leaderboard || []);
          setMyRank(d.data.myRank);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex justify-center py-8">
        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (leaderboard.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-950 dark:to-slate-900 rounded-3xl p-1 shadow-lg overflow-hidden group">
      <div className="bg-white dark:bg-slate-900 rounded-[22px] p-4 sm:p-5 h-full border border-transparent dark:border-indigo-900/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Haftanın Üretenleri
          </h3>
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const isTop3 = index < 3;
            return (
              <div 
                key={entry.user.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-xl border transition-all",
                  index === 0 ? "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20" : 
                  index === 1 ? "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700" :
                  index === 2 ? "bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20" :
                  "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-6 flex justify-center font-bold text-sm",
                    index === 0 ? "text-amber-600 dark:text-amber-400 text-base" : 
                    index === 1 ? "text-slate-600 dark:text-slate-400" :
                    index === 2 ? "text-orange-600 dark:text-orange-400" :
                    "text-slate-400"
                  )}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </div>
                  
                  <Link to={`/profile/${entry.user.username}`} className="flex items-center gap-2 min-w-0 group/user">
                    <Avatar
                      url={entry.user.avatarUrl}
                      name={entry.user.displayName || entry.user.username}
                      size="sm"
                      className={cn("ring-2", isTop3 ? "ring-white dark:ring-slate-800" : "ring-transparent")}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover/user:text-indigo-600 transition-colors">
                          {entry.user.displayName || entry.user.username}
                        </span>
                        {entry.user.isVerified && <VerifiedBadge iconClassName="w-3.5 h-3.5" withModal={false} />}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {entry.score} XP
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {myRank && myRank.rank > 10 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Sen #{myRank.rank}. sıradasın ({myRank.score} XP)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
