import React, { useState, useEffect } from "react";
import { CreatePost } from "../components/CreatePost";
import { PostCard } from "../components/PostCard";
import { StoriesBar } from "../components/StoriesBar";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { usePagination } from "../hooks/usePagination";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { Sparkles, Users, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

export type FeedTab = "for_you" | "following";

export function Feed() {
  const [activeTab, setActiveTab] = useState<FeedTab>("for_you");
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const endpoint = activeTab === "for_you" ? "/feed" : "/feed/following";
  const {
    data: posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadInitial,
    loadMore,
    addItem,
  } = usePagination(endpoint);

  useEffect(() => {
    loadInitial();
  }, [activeTab, loadInitial]);

  const handleTabChange = (tab: FeedTab) => {
    if (tab === "following" && !isAuthenticated) {
      openModal();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col h-full w-full min-h-screen bg-white">
      {/* 1. Feed Header & Segmented Tabs */}
      <header className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 pt-3.5 pb-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Modern Segmented Control */}
          <div 
            className="flex items-center p-1 bg-slate-100/80 rounded-2xl w-full sm:w-auto"
            role="tablist"
            aria-label="Akış Sekmeleri"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "for_you"}
              aria-controls="feed-panel"
              id="tab-for-you"
              onClick={() => handleTabChange("for_you")}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 select-none min-h-[38px] ${
                activeTab === "for_you"
                  ? "text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {activeTab === "for_you" && (
                <motion.div
                  layoutId="feedActiveSegment"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Sizin İçin</span>
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "following"}
              aria-controls="feed-panel"
              id="tab-following"
              onClick={() => handleTabChange("following")}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 select-none min-h-[38px] ${
                activeTab === "following"
                  ? "text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {activeTab === "following" && (
                <motion.div
                  layoutId="feedActiveSegment"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Takip Edilenler</span>
              </span>
            </button>
          </div>

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={loadInitial}
            disabled={loading}
            aria-label="Akışı Yenile"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80 active:scale-95 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </header>

      {/* 2. Stories Bar */}
      <StoriesBar />

      {/* 3. Create Post Composer */}
      <CreatePost onPostCreated={addItem} />

      {/* 4. Feed Stream */}
      <div 
        id="feed-panel" 
        role="tabpanel" 
        aria-labelledby={`tab-${activeTab === "for_you" ? "for-you" : "following"}`}
        className="flex-1 w-full"
      >
        {loading ? (
          <div className="py-16">
            <LoadingState size="md" text="Gönderiler yükleniyor..." />
          </div>
        ) : error ? (
          <div className="px-4 py-8 max-w-lg mx-auto">
            <ErrorState
              title="Gönderiler yüklenemedi"
              message={error}
              retryLabel="Yeniden Dene"
              onRetry={loadInitial}
            />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="flex flex-col pb-20">
            <InfiniteScroll hasMore={hasMore} isLoading={loadingMore} onLoadMore={loadMore}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </InfiniteScroll>
          </div>
        ) : (
          <div className="px-4 py-10 max-w-md mx-auto">
            <EmptyState
              icon={activeTab === "for_you" ? <Sparkles className="w-7 h-7" /> : <Users className="w-7 h-7" />}
              title={
                activeTab === "for_you"
                  ? "Henüz Akışında Gönderi Yok"
                  : "Takip Ettiğin Kişilerden Gönderi Yok"
              }
              description={
                activeTab === "for_you"
                  ? "Topluluk henüz yeni gönderiler paylaşmamış olabilir veya ilk gönderiyi sen oluşturabilirsin!"
                  : "Takip ettiğin kişilerin paylaşımları burada görünecek. Keşfet sayfasından yeni insanları ve projeleri takip etmeye başlayabilirsin."
              }
              action={{
                label: activeTab === "for_you" ? "İlk Gönderini Paylaş" : "İnsanları Keşfet",
                onClick: () => {
                  if (activeTab === "for_you") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    window.location.href = "/explore";
                  }
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
