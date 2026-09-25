import { useSEO } from "../hooks/useSEO";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { PostCard } from "../components/PostCard";
import { Bookmark, Sparkles } from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonList } from "../components/ui/Skeleton";

export function Bookmarks() {
  useSEO({ allowIndexing: false });
  const navigate = useNavigate();
  const { data: posts, setData: setPosts, loading, loadingMore, hasMore, loadInitial, loadMore } = usePagination("/bookmarks");

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto min-h-screen bg-transparent">
      {/* Sticky Header */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white/90 dark:bg-[#070A10]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 py-3.5 flex items-center gap-2.5 transition-colors">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Bookmark className="w-4 h-4" />
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Kaydedilenler
        </h1>
      </header>

      {/* Content */}
      <div className="flex flex-col flex-1 pb-24">
        {loading ? (
          <SkeletonList count={3} className="p-4 sm:p-6" />
        ) : posts.length > 0 ? (
          <div className="p-2 sm:p-4 flex flex-col gap-3">
            <InfiniteScroll items={posts} hasMore={hasMore} isLoading={loadingMore} onLoadMore={loadMore} renderItem={(post) => (<PostCard key={post.id} post={{ ...post, isSaved: true }} onPostDeleted={(id) => setPosts(prev => prev.filter((p: any) => p.id !== id))} onBookmarkToggled={(id, isSaved) => { if (!isSaved) setPosts(prev => prev.filter((p: any) => p.id !== id)); }} />)} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              icon={<Bookmark className="w-7 h-7" />}
              title="Kaydedilen Gönderi Yok"
              description="Daha sonra tekrar incelemek istediğiniz gönderilerin altındaki yer imi simgesine dokunarak kaydedebilirsiniz."
              action={{ label: "Keşfet", onClick: () => navigate("/explore") }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
