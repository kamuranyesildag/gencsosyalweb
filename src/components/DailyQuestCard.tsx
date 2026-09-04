import React, { useState, useEffect } from "react";
import { Target, CheckCircle2, Trophy, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";

export function DailyQuestCard() {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [quest, setQuest] = useState<any>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchApi("/gamification/daily-quest")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setQuest(d.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated || loading || !quest) return null;

  const isComplete = quest.isComplete;
  const claimed = quest.claimed;
  const progress = quest.progress;
  const total = quest.total;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetchApi("/gamification/daily-quest/claim", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setQuest((prev: any) => ({ ...prev, claimed: true }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <section
      aria-label="Günün Görevi"
      className="bg-white dark:bg-[#0D121D] rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs relative overflow-hidden"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {quest.title}
          </h3>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            +{quest.rewardXP} XP
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
        {quest.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
          <span>İlerleme</span>
          <span
            className={cn(
              isComplete
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-blue-600 dark:text-blue-400"
            )}
          >
            {progress} / {total}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(progress, total) / total) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-colors",
              isComplete ? "bg-emerald-500" : "bg-blue-600"
            )}
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={!isComplete || claimed || claiming}
        onClick={handleClaim}
        className={cn(
          "w-full py-2 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer",
          !isComplete
            ? "bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 cursor-not-allowed"
            : claimed
            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 cursor-default"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.98]"
        )}
      >
        {claiming ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : claimed ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ödül Alındı
          </>
        ) : !isComplete ? (
          "Devam Ediyor"
        ) : (
          <>
            <Trophy className="w-3.5 h-3.5" />
            Ödülü Al
          </>
        )}
      </button>
    </section>
  );
}
