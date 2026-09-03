import React, { useState } from "react";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const POLL_OPTIONS = [
  { id: 1, text: "Yapay Zeka (AI)", votes: 45 },
  { id: 2, text: "Web Geliştirme", votes: 30 },
  { id: 3, text: "Mobil Uygulama", votes: 15 },
  { id: 4, text: "Oyun Geliştirme", votes: 10 },
];

export function QuickPollCard() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = POLL_OPTIONS.reduce((acc, opt) => acc + opt.votes, 0) + (hasVoted ? 1 : 0);

  const handleVote = (id: number) => {
    if (hasVoted) return;
    setSelectedId(id);
    setHasVoted(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-900 dark:text-indigo-400" />
          Günün Anketi
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          Yeni
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Şu an en çok ilgini çeken yazılım alanı hangisi?
      </p>

      <div className="space-y-2.5">
        {POLL_OPTIONS.map((option) => {
          const isSelected = selectedId === option.id;
          const votes = option.votes + (isSelected ? 1 : 0);
          const percentage = Math.round((votes / (totalVotes || 1)) * 100);

          return (
            <button
              key={option.id}
              type="button"
              disabled={hasVoted}
              onClick={() => handleVote(option.id)}
              className={cn(
                "w-full relative flex items-center justify-between p-3 rounded-xl border transition-all text-left overflow-hidden group",
                hasVoted
                  ? isSelected
                    ? "border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 dark:border-indigo-500/30"
                    : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                  : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              )}
            >
              {/* Progress Background (Shows after vote) */}
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "absolute left-0 top-0 bottom-0 z-0",
                    isSelected ? "bg-indigo-100 dark:bg-indigo-500/20" : "bg-slate-100 dark:bg-slate-800"
                  )}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center gap-2">
                <span className={cn(
                  "text-sm font-semibold transition-colors",
                  hasVoted && isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"
                )}>
                  {option.text}
                </span>
                {hasVoted && isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                )}
              </div>

              {/* Percentage */}
              {hasVoted && (
                <span className={cn(
                  "relative z-10 text-xs font-bold",
                  isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"
                )}>
                  {percentage}%
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {hasVoted && (
        <p className="text-xs text-center text-slate-400 font-medium mt-4">
          Toplam {totalVotes} oy verildi
        </p>
      )}
    </div>
  );
}
