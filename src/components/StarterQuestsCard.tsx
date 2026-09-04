import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, Sparkles, X, ChevronRight } from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useNavigate } from "react-router";
import { Button } from "./ui/Button";

interface ProgressData {
  followCount: number;
  hasPost: boolean;
  hasProject: boolean;
  isCompleted: boolean;
}

export function StarterQuestsCard() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();

  const fetchProgress = async () => {
    try {
      const res = await fetchApi("/onboarding/progress");
      const json = await res.json();
      if (json.success) {
        setProgress(json.data);
      }
    } catch (e) {
      console.error("Progress fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const handleRefresh = () => fetchProgress();
    window.addEventListener("refreshOnboarding", handleRefresh);
    return () => window.removeEventListener("refreshOnboarding", handleRefresh);
  }, []);

  if (loading || isHidden || !user || user.onboardingCompleted || !progress) {
    return null;
  }

  const tasks = [
    {
      id: "follow",
      title: "İlk 5 kişiyi takip et",
      completed: progress.followCount >= 5,
      onClick: () => {
        navigate("/explore");
      },
    },
    {
      id: "post",
      title: "İlk gönderini paylaş",
      completed: progress.hasPost,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const texta = document.querySelector("textarea");
        if (texta) texta.focus();
      },
    },
    {
      id: "project",
      title: "İlk projeni ekle",
      completed: progress.hasProject,
      onClick: () => {
        navigate("/settings?tab=projects");
      },
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const isAllCompleted = completedCount === tasks.length || progress.isCompleted;

  const handleCompleteOnboarding = async () => {
    try {
      await fetchApi("/onboarding/complete", { method: "POST" });
      window.location.reload();
      setIsHidden(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Başlangıç Görevleri"
      className="bg-white dark:bg-[#0D121D] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xs mb-3 mx-2 sm:mx-4 p-4 sm:p-5 relative group overflow-hidden"
    >
      {/* Top progress line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-slate-100 dark:bg-white/[0.06]">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-start justify-between mb-3.5 pt-0.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 stroke-[2]" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-[15px] tracking-tight">
              Genç Sosyal'e Başla
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completedCount} / {tasks.length} tamamlandı
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsHidden(true)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => !task.completed && task.onClick()}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
              task.completed
                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30"
                : "bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/70 dark:border-white/[0.06] hover:bg-slate-100/80 dark:hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {task.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
              <span
                className={`text-xs font-medium truncate ${
                  task.completed
                    ? "text-slate-400 dark:text-slate-500 line-through"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {task.title}
              </span>
            </div>
            {!task.completed && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isAllCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            className="flex flex-col gap-2 pt-1"
          >
            <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl text-center border border-emerald-200/60 dark:border-emerald-800/40">
              Tebrikler! Tüm başlangıç görevlerini tamamladın.
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompleteOnboarding}
              className="w-full font-semibold rounded-xl text-xs py-2 shadow-xs"
            >
              Keşfetmeye Başla
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
