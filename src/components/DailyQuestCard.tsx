import React, { useState } from "react";
import { Target, CheckCircle2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export function DailyQuestCard() {
  const [claimed, setClaimed] = useState(false);
  const [progress, setProgress] = useState(2); // e.g. 2 out of 3
  const total = 3;

  const isComplete = progress >= total;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-900 rounded-2xl p-4 sm:p-5 border border-indigo-100 dark:border-indigo-900/50 shadow-xs relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />

      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Target className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight">
            Günün Görevi
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            +50 XP Kazan
          </p>
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
        Bugün 3 farklı gönderiye yorum yap ve sohbete katıl.
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
          <span>İlerleme</span>
          <span className={cn(isComplete ? "text-green-600 dark:text-green-400" : "text-indigo-600 dark:text-indigo-400")}>
            {progress} / {total}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(progress / total) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-colors",
              isComplete ? "bg-green-500" : "bg-indigo-500"
            )}
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={!isComplete || claimed}
        onClick={() => setClaimed(true)}
        className={cn(
          "w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
          !isComplete 
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" 
            : claimed 
              ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 cursor-default"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow active:scale-[0.98]"
        )}
      >
        {claimed ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Ödül Alındı
          </>
        ) : !isComplete ? (
          "Devam Ediyor"
        ) : (
          <>
            <Trophy className="w-4 h-4" />
            Ödülü Topla
          </>
        )}
      </button>
    </div>
  );
}
