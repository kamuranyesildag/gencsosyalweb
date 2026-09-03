import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, X } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 md:bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Gönderi Oluştur</h1>
        </div>
        <button onClick={() => navigate("/home")} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto md:py-8 md:px-6">
        <div className="md:bg-white dark:bg-slate-950 md:rounded-[24px] md:shadow-sm md:border md:border-slate-200 dark:border-slate-800/60 h-full">
          {/* We strip some of the nested paddings by using a wrapper if we wanted, but CreatePost handles it fine. */}
          <CreatePost 
            communityId={communityId ? parseInt(communityId) : undefined} 
            onPostCreated={(post) => {
              window.dispatchEvent(new Event("refreshOnboarding"));
              handleBack();
            }} 
          />
        </div>
      </main>
    </div>
  );
}
