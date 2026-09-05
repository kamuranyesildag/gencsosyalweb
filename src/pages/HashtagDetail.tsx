import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchApi } from "../lib/api";
import { PostCard } from "../components/PostCard";
import { ArrowLeft, Hash } from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";

export function HashtagDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [hashtagInfo, setHashtagInfo] = useState<any>(null);

  const { data: posts, setData: setPosts, loading, loadingMore, hasMore, loadInitial, loadMore } = usePagination(`/hashtags/${name}`);

  useEffect(() => {
    const loadHashtag = async () => {
      try {
        const res = await fetchApi(`/hashtags/${name}`);
        const json = await res.json();
        if (json.success) {
          setHashtagInfo(json.data.hashtag);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadHashtag();
    loadInitial();
  }, [name, loadInitial]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-16 z-20 bg-white dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center gap-3.5 shadow-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Geri"
          className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <span className="text-slate-900 dark:text-slate-100">#</span>
            {name}
          </h1>
          {hashtagInfo && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{hashtagInfo.usageCount} gönderi</p>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col flex-1 pb-24">
        {loading ? (
          <div className="p-4 sm:p-6 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : posts.length > 0 ? (
          <div className="divide-y divide-slate-100">
<InfiniteScroll items={posts} hasMore={hasMore} isLoading={loadingMore} onLoadMore={loadMore} renderItem={(post) => (<PostCard key={post.id} post={post} onPostDeleted={(id) => setPosts(prev => prev.filter((p: any) => p.id !== id))} />)} />
</div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              icon={<Hash className="w-7 h-7" />}
              title="Gönderi Bulunamadı"
              description={`#${name} etiketiyle henüz bir gönderi paylaşılmamış.`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
