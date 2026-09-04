import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, X, Sparkles } from "lucide-react";
import { CreatePost } from "../components/CreatePost";
import { useAuthStore } from "../context/useAuth";

export function CreatePostPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get("communityId");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] pb-16">
      {/* 1. STICKY SUB-HEADER (Liquid Glass) */}
      <header className="sticky top-[60px] z-20 bg-white/85 dark:bg-[#0D121D]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
        <div className="flex items-center justify-between h-12 w-full max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Geri Dön"
              className="flex items-center justify-center min-w-[36px] min-h-[36px] w-9 h-9 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Gönderi Oluştur
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Kapat ve ana akışa dön"
            className="flex items-center justify-center min-w-[36px] min-h-[36px] w-9 h-9 -mr-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN COMPOSER SURFACE */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-3 sm:p-5">
        <div className="bg-white dark:bg-[#0D121D] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-4 sm:p-6 transition-colors">
          <CreatePost
            standalone={true}
            autoFocus={true}
            communityId={communityId ? parseInt(communityId) : undefined}
            onPostCreated={() => {
              window.dispatchEvent(new Event("refreshOnboarding"));
              navigate("/home");
            }}
          />
        </div>

        {/* Subtle Keyboard & Community Tip */}
        <div className="flex items-center justify-between gap-2 px-2 mt-3 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Fikirlerini ve projelerini tüm toplulukla paylaş</span>
          </span>
          <span className="hidden sm:inline-block">
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Enter
            </kbd>{" "}
            ile gönder
          </span>
        </div>
      </main>
    </div>
  );
}
