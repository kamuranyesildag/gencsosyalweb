import React, { useState } from "react";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const POLL_OPTIONS = [
  { id: 1, text: "Yapay Zeka & LLM", votes: 45 },
  { id: 2, text: "Web & Fullstack", votes: 30 },
  { id: 3, text: "Mobil Geliştirme", votes: 15 },
  { id: 4, text: "Oyun & 3D Tasarım", votes: 10 },
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
    <section
      aria-label="Günün Anketi"
      className="bg-white dark:bg-[#0D121D] rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Günün Anketi
        </h3>
        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
          Haftalık
        </span>
      </div>

      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-3">
        Şu an en çok ilgini çeken yazılım alanı hangisi?
      </p>

      <div className="space-y-2">
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
                "w-full relative flex items-center justify-between p-2.5 rounded-xl border transition-all text-left overflow-hidden text-xs",
                hasVoted
                  ? isSelected
                    ? "border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-500/30"
                    : "border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]"
                  : "border-slate-200/80 dark:border-white/[0.08] hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer"
              )}
            >
              {/* Progress Background */}
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "absolute left-0 top-0 bottom-0 z-0",
                    isSelected
                      ? "bg-blue-100/70 dark:bg-blue-950/40"
                      : "bg-slate-100/70 dark:bg-white/[0.04]"
                  )}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center gap-1.5">
                <span
                  className={cn(
                    "font-medium transition-colors",
                    hasVoted && isSelected
                      ? "text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  {option.text}
                </span>
                {hasVoted && isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                )}
              </div>

              {/* Percentage */}
              {hasVoted && (
                <span
                  className={cn(
                    "relative z-10 font-semibold",
                    isSelected
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  %{percentage}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {hasVoted && (
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 font-medium mt-2.5">
          Toplam {totalVotes} oy verildi
        </p>
      )}
    </section>
  );
}
