import React, { useEffect } from "react";
import { PostCard } from "../components/PostCard";
import { Bookmark, Sparkles } from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";

export function Bookmarks() {
  const { data: posts, loading, loadingMore, hasMore, loadInitial, loadMore } = usePagination("/bookmarks");

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-200/80 min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-16 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center gap-2.5 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
          <Bookmark className="w-4 h-4" />
        </div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Kaydedilenler
        </h1>
      </header>

      {/* Content */}
      <div className="flex flex-col flex-1 pb-24">
        {loading ? (
          <div className="p-4 sm:p-6 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : posts.length > 0 ? (
          <InfiniteScroll hasMore={hasMore} isLoading={loadingMore} onLoadMore={loadMore}>
            <div className="divide-y divide-slate-100">
              {posts.map((post) => (
                <PostCard key={post.id} post={{ ...post, isSaved: true }} />
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              icon={Bookmark}
              title="Kaydedilen Gönderi Yok"
              description="Daha sonra tekrar incelemek istediğiniz gönderilerin altındaki yer imi simgesine dokunarak kaydedebilirsiniz."
            />
          </div>
        )}
      </div>
    </div>
  );
}
