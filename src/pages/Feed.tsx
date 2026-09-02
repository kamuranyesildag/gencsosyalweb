import { useNavigate } from 'react-router';
import React, { useState, useEffect } from "react";
import { CreatePost } from "../components/CreatePost";
import { PostCard } from "../components/PostCard";
import { StoriesBar } from "../components/StoriesBar";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { LoadingState } from "../components/ui/LoadingState";
import { SkeletonList } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { usePagination } from "../hooks/usePagination";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { Sparkles, Users, RefreshCw } from "lucide-react";
import { Avatar } from "../components/ui/Avatar";
import { StarterQuestsCard } from "../components/StarterQuestsCard";
import { OnboardingModal } from "../components/OnboardingModal";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export type FeedTab = "for_you" | "following";

export function Feed() {
  const navigate = useNavigate();
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
      <OnboardingModal />
      <header className="sticky top-14 md:top-[60px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Modern Segmented Control */}
          <div className="flex w-full" role="tablist" aria-label="Akış Sekmeleri">
  <button
    type="button"
    role="tab"
    aria-selected={activeTab === "for_you"}
    aria-controls="feed-panel"
    id="tab-for-you"
    onClick={() => handleTabChange("for_you")}
    className={cn(
      "relative flex-1 flex items-center justify-center py-4 text-[15px] hover:bg-slate-50 transition-colors outline-none",
      activeTab === "for_you" ? "text-slate-900 font-bold" : "text-slate-500 font-medium"
    )}
  >
    <span>Sizin İçin</span>
    {activeTab === "for_you" && (
      <motion.div
        layoutId="feedActiveSegment"
        className="absolute bottom-0 h-1 w-12 bg-slate-900 rounded-t-full"
        transition={{ type: "spring", stiffness: 450, damping: 35 }}
      />
    )}
  </button>
  <button
    type="button"
    role="tab"
    aria-selected={activeTab === "following"}
    aria-controls="feed-panel"
    id="tab-following"
    onClick={() => handleTabChange("following")}
    className={cn(
      "relative flex-1 flex items-center justify-center py-4 text-[15px] hover:bg-slate-50 transition-colors outline-none",
      activeTab === "following" ? "text-slate-900 font-bold" : "text-slate-500 font-medium"
    )}
  >
    <span>Takip Edilenler</span>
    {activeTab === "following" && (
      <motion.div
        layoutId="feedActiveSegment"
        className="absolute bottom-0 h-1 w-12 bg-slate-900 rounded-t-full"
        transition={{ type: "spring", stiffness: 450, damping: 35 }}
      />
    )}
  </button>
</div>

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={loadInitial}
            disabled={loading}
            aria-label="Akışı Yenile"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-slate-900" : ""}`} />
          </button>
        </div>
      </header>

      {/* 2. Stories Bar */}
      <StoriesBar />

      {/* 3. Create Post Trigger */}
      {isAuthenticated && (
        <div className="border-b border-slate-100 bg-white">
          {/* Mobile Trigger */}
          <div className="md:hidden px-4 py-4">
            <div 
              onClick={() => navigate("/create")}
              className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors p-3.5 rounded-full cursor-pointer border border-slate-200/60"
              role="button"
              tabIndex={0}
            >
              <Avatar url={useAuthStore.getState().user?.avatarUrl} name={useAuthStore.getState().user?.displayName || useAuthStore.getState().user?.username || "?"} size="sm" />
              <span className="text-slate-500 font-medium text-[15px]">Ne paylaşmak istiyorsun?</span>
            </div>
          </div>
          {/* Desktop Inline Create */}
          <div className="hidden md:block px-6 pt-4 pb-0">
            <CreatePost onPostCreated={() => { loadInitial(); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </div>
        </div>
      )}
      {/* 4. Feed Stream */}
      <div 
        id="feed-panel" 
        role="tabpanel" 
        aria-labelledby={`tab-${activeTab === "for_you" ? "for-you" : "following"}`}
        className="flex-1 w-full"
      >
        {loading ? (
          <div className="py-16">
            <SkeletonList count={5} className="p-4" />
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
            <InfiniteScroll 
              items={posts}
              renderItem={(post) => <PostCard key={post.id} post={post} />}
              hasMore={hasMore} 
              isLoading={loadingMore} 
              onLoadMore={loadMore} 
            />
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
                    navigate("/explore");
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
