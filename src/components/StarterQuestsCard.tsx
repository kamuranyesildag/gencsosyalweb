import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, Sparkles, X, ChevronRight } from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useNavigate } from "react-router";

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
  const user = useAuthStore(state => state.user);
  
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

  // Expose a global event listener to trigger progress refresh
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
        // Scroll down or open suggestions modal?
        // In the home feed, we'll embed the SuggestedUsers below this card if not completed.
      }
    },
    {
      id: "post",
      title: "İlk gönderini oluştur",
      completed: progress.hasPost,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const texta = document.querySelector('textarea');
        if (texta) texta.focus();
      }
    },
    {
      id: "project",
      title: "İlk projeni oluştur",
      completed: progress.hasProject,
      onClick: () => {
        navigate("/settings?tab=projects");
      }
    }
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const isAllCompleted = completedCount === tasks.length || progress.isCompleted;

  const handleCompleteOnboarding = async () => {
    try {
      await fetchApi("/onboarding/complete", { method: "POST" });
      window.location.reload(); // Refreshes user object
      setIsHidden(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 relative group"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
        <motion.div
          className="h-full bg-slate-1000"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg tracking-tight">Genç Sosyal'e Başla</h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {completedCount} / {tasks.length} tamamlandı
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsHidden(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-900 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {tasks.map(task => (
            <motion.div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                task.completed ? "bg-emerald-50/50 border-emerald-100/60" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:bg-slate-900 hover:border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
              }`}
              onClick={() => !task.completed && task.onClick()}
            >
              <div className="flex items-center gap-3">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <span className={`text-sm sm:text-[15px] font-semibold ${task.completed ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800 dark:text-slate-100"}`}>
                  {task.title}
                </span>
              </div>
              {!task.completed && <ChevronRight className="w-4 h-4 text-slate-400" />}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isAllCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              className="flex flex-col gap-3"
            >
              <div className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-700 text-sm font-bold rounded-xl text-center border border-slate-100 dark:border-slate-800">
                🎉 Harika! Tüm görevleri tamamladın.
              </div>
              <button
                onClick={handleCompleteOnboarding}
                className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Keşfetmeye Başla
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
