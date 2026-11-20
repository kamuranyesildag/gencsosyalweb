import React, { useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  AlertCircle,
  RefreshCw,
  Crown,
  Lock,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { cn } from "../../lib/utils";

/* =========================================================================
   1. CIRCULAR COUNTDOWN TIMER
   Smooth SVG ring with tabular numerals & calm 5-second warning pulse
   ========================================================================= */
interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
  className?: string;
}

export function CircularTimer({
  timeLeft,
  totalTime,
  size = 60,
  className,
}: CircularTimerProps) {
  const prefersReducedMotion = useReducedMotion();
  const safeTotal = Math.max(1, totalTime);
  const ratio = Math.max(0, Math.min(1, timeLeft / safeTotal));
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - ratio);

  const isCritical = timeLeft <= 5;
  const isWarning = timeLeft > 5 && timeLeft <= Math.min(8, Math.ceil(safeTotal * 0.4));

  const ringColor = isCritical
    ? "text-[#EF4444]"
    : isWarning
    ? "text-[#F59E0B]"
    : "text-[#2563EB]";

  const textColor = isCritical
    ? "text-[#EF4444] dark:text-rose-400"
    : isWarning
    ? "text-[#D97706] dark:text-amber-400"
    : "text-slate-900 dark:text-white";

  const surfaceTint = isCritical
    ? "bg-rose-50/90 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-500/25"
    : isWarning
    ? "bg-amber-50/80 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-500/25"
    : "bg-white dark:bg-[#111B2E] border-slate-200/80 dark:border-white/[0.08]";

  return (
    <motion.div
      animate={
        isCritical && !prefersReducedMotion && timeLeft > 0
          ? { scale: [1, 1.05, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.7, repeat: isCritical && timeLeft > 0 ? Infinity : 0, ease: "easeInOut" }}
      style={{ width: size, height: size }}
      className={cn(
        "relative shrink-0 rounded-full border flex items-center justify-center shadow-2xs transition-colors duration-200",
        surfaceTint,
        className
      )}
      role="timer"
      aria-live="off"
      aria-label={`Kalan süre ${timeLeft} saniye`}
    >
      <svg
        className="w-full h-full -rotate-90 p-1"
        viewBox="0 0 56 56"
        aria-hidden="true"
      >
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-200/80 dark:text-white/[0.08]"
        />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" }}
          className={cn("transition-colors duration-200", ringColor)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className={cn("text-sm sm:text-base font-extrabold tabular-nums tracking-tight", textColor)}>
          {timeLeft}
        </span>
        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          sn
        </span>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   2. SEGMENTED PROGRESS BAR
   Clean step indicator for Solo & Live Multiplayer Question Flows
   ========================================================================= */
export type SegmentStatus = "correct" | "wrong" | "skipped" | "current" | "completed" | "upcoming";

interface SegmentedProgressProps {
  total: number;
  currentIndex: number;
  statuses?: Array<"correct" | "wrong" | "skipped" | "completed">;
  rightLabel?: React.ReactNode;
  className?: string;
}

export function SegmentedProgress({
  total,
  currentIndex,
  statuses,
  rightLabel,
  className,
}: SegmentedProgressProps) {
  const count = Math.max(1, total);

  return (
    <div className={cn("flex-1 min-w-0 space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
          Soru {Math.min(currentIndex + 1, count)}{" "}
          <span className="text-slate-400 dark:text-slate-500 font-medium">/ {count}</span>
        </span>
        {rightLabel && <div className="min-w-0 truncate">{rightLabel}</div>}
      </div>

      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuenow={Math.min(currentIndex + 1, count)}
        aria-valuemin={1}
        aria-valuemax={count}
      >
        {Array.from({ length: count }).map((_, idx) => {
          let state: SegmentStatus = "upcoming";
          if (idx < currentIndex) {
            state = statuses?.[idx] || "completed";
          } else if (idx === currentIndex) {
            state = "current";
          }

          const barClass =
            state === "correct"
              ? "bg-[#16A34A]"
              : state === "wrong"
              ? "bg-[#EF4444]"
              : state === "skipped"
              ? "bg-[#F59E0B]"
              : state === "completed"
              ? "bg-[#6366F1]"
              : state === "current"
              ? "bg-[#2563EB]"
              : "bg-slate-200/90 dark:bg-white/[0.08]";

          return (
            <div
              key={idx}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors duration-300",
                barClass
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   3. QUIZ OPTION CARD (A / B / C / D)
   6 distinct visual states: normal, hover, selected, correct, wrong, locked
   ========================================================================= */
export type OptionVisualState =
  | "normal"
  | "selected"
  | "correct"
  | "wrong"
  | "locked"
  | "eliminated";

interface QuizOptionCardProps {
  optionKey: string;
  text: string;
  state: OptionVisualState;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function QuizOptionCard({
  optionKey,
  text,
  state,
  disabled,
  onClick,
  className,
}: QuizOptionCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const cardClass = {
    normal:
      "bg-white dark:bg-[#111B2E] border-slate-200/90 dark:border-white/[0.09] text-slate-900 dark:text-slate-100 hover:border-[#2563EB]/60 hover:bg-blue-50/40 dark:hover:bg-[#16233B] hover:shadow-sm",
    selected:
      "bg-blue-50/90 dark:bg-blue-950/45 border-[#2563EB] text-slate-900 dark:text-white ring-2 ring-[#2563EB]/15 shadow-sm",
    correct:
      "bg-emerald-50/90 dark:bg-emerald-950/35 border-[#16A34A] text-emerald-950 dark:text-emerald-50 ring-2 ring-[#16A34A]/15",
    wrong:
      "bg-rose-50/90 dark:bg-rose-950/35 border-[#EF4444] text-rose-950 dark:text-rose-50 ring-2 ring-[#EF4444]/15",
    locked:
      "bg-slate-50/80 dark:bg-[#0E1626]/70 border-slate-200/70 dark:border-white/[0.05] text-slate-400 dark:text-slate-500 opacity-65",
    eliminated:
      "bg-slate-100/70 dark:bg-[#0D1422]/60 border-slate-200/60 dark:border-white/[0.04] text-slate-400 dark:text-slate-600 opacity-40 line-through",
  }[state];

  const letterBoxClass = {
    normal:
      "bg-slate-100 dark:bg-white/[0.07] text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-white/[0.06] group-hover:bg-blue-100/80 group-hover:text-[#2563EB] dark:group-hover:bg-blue-500/20 dark:group-hover:text-blue-300",
    selected:
      "bg-[#2563EB] text-white border border-[#2563EB] shadow-2xs",
    correct:
      "bg-[#16A34A] text-white border border-[#16A34A]",
    wrong:
      "bg-[#EF4444] text-white border border-[#EF4444]",
    locked:
      "bg-slate-200/70 dark:bg-white/[0.05] text-slate-400 dark:text-slate-500 border border-transparent",
    eliminated:
      "bg-slate-200/60 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 border border-transparent",
  }[state];

  return (
    <motion.button
      type="button"
      disabled={disabled || state === "eliminated"}
      onClick={onClick}
      animate={
        state === "selected" && !prefersReducedMotion
          ? { scale: [1, 1.018, 1] }
          : { scale: 1 }
      }
      whileTap={!disabled && state !== "eliminated" && !prefersReducedMotion ? { scale: 0.985 } : undefined}
      transition={{ type: "spring", stiffness: 460, damping: 28 }}
      className={cn(
        "group w-full min-h-[58px] px-4 py-3.5 rounded-[18px] border-[1.5px] text-left flex items-center gap-3.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B1120]",
        disabled || state === "eliminated" ? "cursor-not-allowed" : "cursor-pointer",
        cardClass,
        className
      )}
    >
      <span
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 transition-colors duration-150",
          letterBoxClass
        )}
      >
        {optionKey}
      </span>

      <span className="flex-1 text-sm sm:text-[15px] font-semibold leading-snug break-words">
        {text}
      </span>

      {state === "correct" && (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span className="hidden xs:inline">Doğru</span>
        </span>
      )}
      {state === "wrong" && (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#EF4444] dark:text-rose-400 shrink-0">
          <XCircle className="w-4 h-4" />
          <span className="hidden xs:inline">Yanlış</span>
        </span>
      )}
      {state === "locked" && (
        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" aria-hidden="true" />
      )}
    </motion.button>
  );
}

/* =========================================================================
   4. ANIMATED NUMERIC SCORE COUNTER
   Subtle vertical roll on score updates with strict tabular-nums
   ========================================================================= */
export function AnimatedScore({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={prefersReducedMotion ? false : { y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={prefersReducedMotion ? undefined : { y: 8, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn("inline-block tabular-nums", className)}
      >
        {value.toLocaleString("tr-TR")}
      </motion.span>
    </AnimatePresence>
  );
}

/* =========================================================================
   5. SIX-CHARACTER ROOM CODE INPUT
   Accessible, ergonomic 6-slot visual code entry with full paste & keyboard support
   ========================================================================= */
interface SixCharCodeInputProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  darkSurface?: boolean;
}

export function SixCharCodeInput({
  value,
  onChange,
  onSubmit,
  disabled,
  darkSurface = false,
}: SixCharCodeInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cleanValue = value.slice(0, 6);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    onChange(sanitized);
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="relative cursor-text select-none"
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={6}
        disabled={disabled}
        value={cleanValue}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        aria-label="6 karakterli quiz oda kodu"
        className="peer absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
      />

      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {Array.from({ length: 6 }).map((_, idx) => {
          const char = cleanValue[idx] || "";
          const isActiveSlot =
            idx === cleanValue.length || (cleanValue.length === 6 && idx === 5);

          return (
            <div
              key={idx}
              className={cn(
                "h-12 sm:h-13 rounded-2xl border flex items-center justify-center font-mono text-lg sm:text-xl font-extrabold tracking-wide transition-all duration-150",
                darkSurface
                  ? char
                    ? "bg-white/15 border-white/45 text-white shadow-xs"
                    : "bg-white/[0.07] border-white/20 text-white/40"
                  : char
                  ? "bg-blue-50/70 dark:bg-blue-950/40 border-[#2563EB]/60 text-slate-900 dark:text-white"
                  : "bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-white/[0.1] text-slate-400",
                isActiveSlot &&
                  (darkSurface
                    ? "peer-focus:border-white peer-focus:ring-2 peer-focus:ring-white/30"
                    : "peer-focus:border-[#2563EB] peer-focus:ring-2 peer-focus:ring-[#2563EB]/20")
              )}
            >
              {char || (
                <span className="text-xs opacity-35 font-sans font-semibold">•</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   6. CHAMPIONSHIP PODIUM (TOP 3)
   Energetic yet refined podium with staggered entrance & gentle 1st trophy motion
   ========================================================================= */
export interface PodiumPlayer {
  userId: number;
  username: string;
  avatarUrl: string | null;
  score: number;
  correctAnswersCount?: number;
}

export function QuizPodium({ podium }: { podium: PodiumPlayer[] }) {
  const prefersReducedMotion = useReducedMotion();
  const first = podium[0];
  const second = podium[1];
  const third = podium[2];

  if (!first) return null;

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-6 pb-2 max-w-xl mx-auto">
      {/* 2nd Place (Left) */}
      <div className="flex flex-col items-center">
        {second ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center space-y-2.5"
          >
            <div className="relative">
              <Avatar
                url={second.avatarUrl}
                name={second.username}
                size="md"
                className="ring-2 ring-slate-300 dark:ring-slate-600 shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100 text-[11px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0B1120]">
                2
              </span>
            </div>
            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate max-w-[96px] sm:max-w-[130px] text-center">
              {second.username}
            </span>
            <div className="w-full h-24 sm:h-28 rounded-t-[20px] bg-slate-100 dark:bg-[#162238] border border-b-0 border-slate-200/90 dark:border-white/[0.08] p-3 flex flex-col items-center justify-between text-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                2. Sıra
              </span>
              <div className="font-mono font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 tabular-nums">
                {second.score.toLocaleString("tr-TR")}
                <span className="text-[10px] font-sans font-semibold text-slate-500 block">
                  puan
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-20" />
        )}
      </div>

      {/* 1st Place (Center, Elevated) */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col items-center space-y-2.5"
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/80 dark:border-amber-500/30 shadow-xs"
        >
          <Trophy className="w-5 h-5" />
        </motion.div>

        <div className="relative">
          <Avatar
            url={first.avatarUrl}
            name={first.username}
            size="lg"
            className="ring-[3px] ring-amber-400 dark:ring-amber-400 shadow-md"
          />
          <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-[#0F2557] text-[11px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0B1120]">
            1
          </span>
        </div>

        <span className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-white truncate max-w-[104px] sm:max-w-[150px] text-center">
          {first.username}
        </span>

        <div className="w-full h-32 sm:h-36 rounded-t-[22px] bg-gradient-to-b from-[#2563EB] to-[#0F2557] text-white p-3.5 flex flex-col items-center justify-between text-center shadow-lg shadow-blue-600/20">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-100">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            Şampiyon
          </span>
          <div className="font-mono font-black text-base sm:text-xl text-white tabular-nums">
            {first.score.toLocaleString("tr-TR")}
            <span className="text-[10px] font-sans font-semibold text-blue-200 block">
              puan
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3rd Place (Right) */}
      <div className="flex flex-col items-center">
        {third ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center space-y-2.5"
          >
            <div className="relative">
              <Avatar
                url={third.avatarUrl}
                name={third.username}
                size="md"
                className="ring-2 ring-amber-700/40 dark:ring-amber-600/50 shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0B1120]">
                3
              </span>
            </div>
            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate max-w-[96px] sm:max-w-[130px] text-center">
              {third.username}
            </span>
            <div className="w-full h-20 sm:h-24 rounded-t-[20px] bg-slate-100/80 dark:bg-[#131E33] border border-b-0 border-slate-200/90 dark:border-white/[0.08] p-3 flex flex-col items-center justify-between text-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                3. Sıra
              </span>
              <div className="font-mono font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 tabular-nums">
                {third.score.toLocaleString("tr-TR")}
                <span className="text-[10px] font-sans font-semibold text-slate-500 block">
                  puan
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-20" />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   7. EMPTY, LOADING & ERROR STATES (NEVER HIDE API ERRORS)
   ========================================================================= */
export function QuizStatePanel({
  icon,
  title,
  description,
  action,
  variant = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: "neutral" | "error";
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border p-7 sm:p-10 text-center flex flex-col items-center justify-center space-y-4",
        variant === "error"
          ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-500/20"
          : "bg-white dark:bg-[#111B2E] border-slate-200/80 dark:border-white/[0.08]"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          variant === "error"
            ? "bg-rose-100 dark:bg-rose-900/40 text-[#EF4444]"
            : "bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400"
        )}
      >
        {icon}
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

export function QuizErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-[18px] border border-rose-200 dark:border-rose-500/25 bg-rose-50/80 dark:bg-rose-950/25 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start sm:items-center gap-2.5 text-sm font-medium text-rose-700 dark:text-rose-300">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#111B2E] border border-rose-200 dark:border-rose-500/30 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tekrar Dene</span>
        </button>
      )}
    </div>
  );
}
