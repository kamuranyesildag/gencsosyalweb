import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { 
  Mail, 
  Plus, 
  CheckCircle2, 
  MessageSquarePlus, 
  Sparkles,
  Search
} from "lucide-react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle } from "../components/ui/Skeleton";
import { formatTimeAgo } from "../lib/utils";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { NewMessageDialog } from "../components/NewMessageDialog";

export function Messages() {
  const [showNewMsg, setShowNewMsg] = useState(false);
  const { data: conversations, loading, loadingMore, hasMore, loadInitial, loadMore } = usePagination("/messages/conversations");

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-100 min-h-screen bg-white select-none">
      {/* STICKY HEADER */}
      <header className="sticky top-16 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100/90 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Mesajlar
          </h1>
          {totalUnread > 0 && (
            <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-xs rounded-full">
              {totalUnread} okunmamış
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowNewMsg(true)}
          className="rounded-full font-bold shadow-xs shadow-slate-500/20"
        >
          Yeni Mesaj
        </Button>
      </header>

      {/* CONVERSATIONS LIST / SKELETON / EMPTY */}
      <div className="flex flex-col flex-1 pb-24">
        {/* Loading Skeleton */}
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3.5 p-4 sm:p-5">
                <SkeletonCircle size="lg" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-3.5 w-48 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-slate-100">
<InfiniteScroll items={conversations} hasMore={hasMore} isLoading={loadingMore} onLoadMore={loadMore} renderItem={(conv) => {const hasUnread = conv.unreadCount > 0;
                const otherUser = conv.otherUser;

                return (
                  <div key={conv.id}>
                    <Link
                      to={`/messages/${conv.id}`}
                      className={`flex items-center gap-3.5 sm:gap-4 p-4 sm:p-5 transition-all group relative ${
                        hasUnread
                          ? "bg-slate-100/30 hover:bg-slate-100/60"
                          : "hover:bg-slate-50/80 bg-white"
                      }`}
                    >
                      {/* Unread Left Border Highlight */}
                      {hasUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
                      )}

                      {/* Avatar */}
                      <Avatar
                        url={otherUser?.avatarUrl}
                        name={otherUser?.displayName || otherUser?.username}
                        size="lg"
                        className="ring-1 ring-slate-200 group-hover:ring-slate-300 transition-all shrink-0"
                      />

                      {/* Conversation Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`font-bold truncate text-sm sm:text-base transition-colors ${
                                hasUnread
                                  ? "text-slate-900 group-hover:text-slate-900"
                                  : "text-slate-900 group-hover:text-slate-900"
                              }`}
                            >
                              {otherUser?.displayName || otherUser?.username || "Kullanıcı"}
                            </span>
                            {otherUser?.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 fill-slate-100 shrink-0" />
                            )}
                            <span className="text-xs text-slate-400 font-medium truncate hidden sm:inline">
                              @{otherUser?.username}
                            </span>
                          </div>

                          <span
                            className={`text-xs shrink-0 font-medium ${
                              hasUnread ? "text-slate-900 font-bold" : "text-slate-400"
                            }`}
                          >
                            {formatTimeAgo(conv.updatedAt)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <p
                            className={`truncate text-xs sm:text-sm leading-relaxed ${
                              hasUnread
                                ? "font-semibold text-slate-800"
                                : "text-slate-500 font-normal"
                            }`}
                          >
                            {conv.lastMessage?.content || "Medya/Ek içerik"}
                          </p>

                          {hasUnread && (
                            <span className="bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shrink-0 shadow-xs">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );}} />
</div>
        ) : (
          <div className="px-6 py-16 max-w-md mx-auto text-center">
            <EmptyState
              icon={<Mail className="w-8 h-8 text-slate-400" />}
              title="Mesaj Kutunuz Boş"
              description="Topluluktaki diğer kullanıcılarla doğrudan iletişime geçmek için ilk sohbetinizi başlatın."
              action={{
                label: "Yeni Sohbet Başlat",
                onClick: () => setShowNewMsg(true),
              }}
            />
          </div>
        )}
      </div>

      {/* NEW MESSAGE DIALOG */}
      <NewMessageDialog isOpen={showNewMsg} onClose={() => setShowNewMsg(false)} />
    </div>
  );
}
